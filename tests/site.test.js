// Site-wide checks over every HTML page: links, script order, translations, share tags, public-safety.
const test = require('node:test'), assert = require('node:assert');
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const SKIP = new Set(['.git', '.superpowers', '.impeccable', '.claude', 'node_modules', 'tests']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const files = walk(ROOT);
// slash.html is an http-only helper (App Engine adds the trailing slash), not a site page
const pages = files.filter(f => f.endsWith('.html') && path.basename(f) !== 'slash.html');
const rel = f => path.relative(ROOT, f).split(path.sep).join('/');
const read = f => fs.readFileSync(f, 'utf8');

global.window = {};
vm.runInThisContext(read(path.join(ROOT, 'site-map.js')));
const UI = require('../site.js');
const SITE = window.HY_SITE;

const attrs = (html, re) => [...html.matchAll(re)].map(m => m[1]);
const localScripts = html => attrs(html, /<script[^>]*\ssrc="([^"]+)"/g).filter(s => !/^https?:/.test(s)).map(s => s.split('?')[0]);

test('every registry page and section index exists', () => {
  for (const p of [...SITE.sections, ...SITE.pages, { path: 'index.html' }])
    assert.ok(fs.existsSync(path.join(ROOT, p.path)), p.path);
});

test('links resolve', () => {
  for (const f of pages) {
    const html = read(f);
    for (const u of attrs(html, /\s(?:href|src)="([^"]*)"/g)) {
      if (/^(https?:|mailto:|#|data:|\/\/)/.test(u) || u === '') continue;
      let t = u.split('#')[0].split('?')[0]; if (t.endsWith('/')) t += 'index.html';
      assert.ok(fs.existsSync(path.join(path.dirname(f), t)), `${rel(f)} → ${u}`);
    }
  }
});

test('no root-absolute URLs', () => {
  for (const f of pages) assert.doesNotMatch(read(f), /\s(?:href|src)="\/(?!\/)/, rel(f));
});

test('script order: lang → site-map → site → i18n → page scripts, never modules', () => {
  for (const f of pages) {
    const html = read(f), s = localScripts(html).map(x => x.replace(/^(\.\.\/)+/, ''));
    const i = n => s.indexOf(n);
    assert.ok(i('site-map.js') >= 0 && i('site.js') > i('site-map.js') && i('i18n.js') > i('site.js'), `${rel(f)}: ${s.join(', ')}`);
    s.forEach((x, k) => { if (x.startsWith('lang/')) assert.ok(k < i('site-map.js'), `${rel(f)}: ${x} after site-map.js`); });
    s.slice(i('i18n.js') + 1).forEach(x => assert.ok(!x.startsWith('lang/'), `${rel(f)}: ${x} after i18n.js`));
    assert.doesNotMatch(html, /<script[^>]*type="module"[^>]*src=/, rel(f));
  }
});

// First paint must already be the finished page: deferred shell scripts (header, language, widgets) are
// render-blocking, the fonts are embedded (on file:// Chrome re-fetches web fonts for every page and paints a fallback
// face first), and transitions stay off until load so the language buttons don't fade from EN to VI on each page.
// Never hide the body instead: on file:// Chrome doesn't keep the old page on screen, so a hidden body flashes blank.
test('every page paints finished on its first frame', () => {
  const css = read(path.join(ROOT, 'styles.css'));
  assert.match(css, /html\.hy-boot \*[^{]*\{transition:none!important\}/);
  assert.match(css, /scrollbar-gutter:stable/);
  assert.doesNotMatch(css, /html\.[\w-]+ body\{visibility:hidden\}/);
  const fonts = read(path.join(ROOT, 'fonts.css'));
  for (const fam of ['Be Vietnam Pro', 'Barlow Condensed', 'IBM Plex Mono']) assert.ok(fonts.includes(`font-family:'${fam}'`), fam);
  assert.doesNotMatch(fonts, /url\((?!data:)/, 'fonts.css must embed its fonts');
  for (const f of pages) {
    const html = read(f), head = html.slice(0, html.indexOf('</head>'));
    assert.doesNotMatch(html, /fonts\.googleapis/, `${rel(f)}: web fonts come from fonts.css`);
    const sheets = attrs(head, /<link rel="stylesheet" href="([^"]+)"/g).map(s => s.replace(/^(\.\.\/)+/, '').split('?')[0]);
    assert.equal(sheets[0], 'fonts.css', rel(f));
    for (const tag of head.match(/<script defer[^>]*>/g)) assert.match(tag, /blocking="render"/, `${rel(f)}: ${tag}`);
    const inline = head.match(/<script>([^<]*hy-boot[^<]*)<\/script>/);
    assert.ok(inline && head.indexOf(inline[0]) < head.search(/<script defer/), rel(f));
  }
});

test('every data-i18n key has VI', () => {
  const shellKeys = attrs(UI.renderHeader('', null) + UI.renderFooter(''), /data-i18n(?:-aria)?="([^"]+)"/g);
  for (const f of pages) {
    const html = read(f), ctx = { window: {} };
    vm.createContext(ctx);
    for (const s of localScripts(html).filter(x => x.replace(/^(\.\.\/)+/, '').startsWith('lang/')))
      vm.runInContext(read(path.join(path.dirname(f), s)), ctx);
    const VI = ctx.window.HY_VI || {};
    // page scripts' own strings: T('key', 'English')
    const scriptKeys = localScripts(html).filter(x => !/lang\//.test(x)).flatMap(s => attrs(read(path.join(path.dirname(f), s)), /\bT\('([a-z][\w.-]*)'/g));
    const keys = [...attrs(html, /data-i18n(?:-content|-aria)?="([^"]+)"/g), ...scriptKeys, ...(html.includes('id="hy-header"') ? shellKeys : [])];
    const missing = [...new Set(keys)].filter(k => VI[k] == null);
    assert.deepEqual(missing, [], rel(f));
  }
});

test('open graph tags on every page', () => {
  for (const f of pages) {
    const html = read(f), og = n => (html.match(new RegExp(`<meta property="og:${n}" content="([^"]*)"`)) || [])[1];
    assert.ok(og('title') && og('description'), `${rel(f)} og:title/description`);
    assert.match(og('url') || '', /^https:\/\/hytekvn\.com\.vn\//, `${rel(f)} og:url`);
    assert.match(og('image') || '', /^https:\/\/hytekvn\.com\.vn\//, `${rel(f)} og:image`);
  }
});

test('no photos: no <img> tags', () => {
  for (const f of pages) assert.doesNotMatch(read(f), /<img\b/i, rel(f));
});

test('public-safe: no internal notes in shipped files', () => {
  for (const f of files.filter(f => /\.(html|js|css)$/.test(f))) {
    const s = read(f).replace(/url\(data:[^)]*\)/g, ''); // embedded font bytes are not text
    assert.doesNotMatch(s, /TODO|provisional|chém|\bowner\b/i, rel(f));
    assert.doesNotMatch(s, /\bNDA\b/, rel(f));
  }
});

test('the landing page is the original one-page site: old anchors work in place', () => {
  const html = read(path.join(ROOT, 'index.html'));
  for (const id of ['stage', 'about', 'equipment', 'services', 'protocols', 'gem', 'simulator', 'partnership', 'contact'])
    assert.match(html, new RegExp(`id="${id}"`), id);
});

test('landing page: one menu bar (original anchors + Knowledge hub), no extra hub block', () => {
  const html = read(path.join(ROOT, 'index.html'));
  assert.doesNotMatch(html, /id="hub"|data-eqmap|class="hubin"|class="subnav"/);
  const tpl = (html.match(/<template id="hy-nav">([\s\S]*?)<\/template>/) || [])[1] || '';
  for (const id of ['about', 'equipment', 'services', 'protocols', 'gem', 'simulator', 'contact']) assert.match(tpl, new RegExp(`href="#${id}"`), id);
  assert.match(tpl, /href="equipment\/index\.html"[^>]*data-i18n="nav\.hub"/);
  assert.ok(!fs.existsSync(path.join(ROOT, 'hub/index.html')));
  // menu order = page order, so a click never runs backwards past what the visitor just read
  const ids = attrs(tpl, /href="#([^"]+)"/g), at = id => html.indexOf(`id="${id}"`);
  assert.deepEqual(ids, [...ids].sort((a, b) => at(a) - at(b)));
  assert.match(html, /<div id="stage" data-scroll-skip>/, 'menu jumps skip the scroll-driven chamber');
});

test('every page loads the current styles.css and hub.css (same cache key)', () => {
  for (const f of pages) {
    const all = [...read(f).matchAll(/href="((?:\.\.\/)*(?:styles|hub)\.css\?v=\d+)"/g)].map(m => m[1].replace(/^(\.\.\/)+/, ''));
    assert.deepEqual(all.sort(), ['hub.css?v=9', 'styles.css?v=9'], rel(f));
  }
});

// the contact page shows the landing page's contact block (original copy), word for word
test('contact page and landing contact block stay the same', () => {
  const block = f => { const h = read(path.join(ROOT, f)); const s = h.indexOf('<div class="cgrid">'); const e = h.indexOf('</section>', s); return h.slice(s, e); };
  const facts = h => ({ keys: attrs(h, /data-i18n="([^"]+)"/g), hrefs: attrs(h, /href="(mailto:[^"]+)"/g), text: h.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() });
  assert.deepEqual(facts(block('contact/index.html')), facts(block('index.html')));
});

// Scrolling stays smooth: a WebGL frame drawn while its canvas is just off screen stalls Chrome's next swap
// (measured 250 ms when the services stage scrolled away), and the platform viewer is built while the visitor
// reads the hero so its setup and shader compile never land mid-scroll.
test('3D canvases draw only on screen; the platform viewer warms up early', () => {
  const app = read(path.join(ROOT, 'app.js')), eq = read(path.join(ROOT, 'equip.js'));
  assert.match(app, /const onScreen=el=>\{[^}]*b\.bottom>0&&b\.top<innerHeight\}/);
  assert.doesNotMatch(eq, /visible=es\[0\]\.isIntersecting\},\{rootMargin/);
  assert.match(eq, /requestIdleCallback\(f,/);
  assert.match(eq, /compileAsync/);
});

// On 120–240 Hz screens a 3D draw on every refresh saturated a laptop GPU and the page scroll stuttered:
// both scenes skip refreshes that come sooner than ~12 ms after their last draw.
test('3D scenes cap their draw rate on high-refresh screens', () => {
  const app = read(path.join(ROOT, 'app.js')), eq = read(path.join(ROOT, 'equip.js'));
  assert.match(app, /function frame\(now\)\{\s*if\(!RM\)requestAnimationFrame\(frame\);\s*if\(now!==undefined\)\{if\(now-lastDraw<MIN_DT\)return;lastDraw=now\}/);
  assert.match(app, /const MIN_DT=12;/);
  assert.match(eq, /function loop\(now\)\{requestAnimationFrame\(loop\);if\(now-last<12\)return;/);
});

// Desktop wheel scrolling stops on whole screens: every section, and inside the chamber stage the whole chamber
// plus each of the six service steps (the stops must sit where app.js puts the steps).
test('landing: wheel stops on whole screens, stage stops match the service steps', () => {
  const html = read(path.join(ROOT, 'index.html')), css = read(path.join(ROOT, 'styles.css')), app = read(path.join(ROOT, 'app.js'));
  assert.match(css, /html:has\(#stage\)\{scroll-snap-type:y mandatory\}/);
  for (const id of ['top', 'about', 'equipment', 'protocols', 'gem', 'simulator', 'partnership', 'contact']) assert.match(css, new RegExp(`#${id}[,{][^}]*scroll-snap-align:start`), id);
  const [, S0, SL] = app.match(/const S0=([\d.]+),SL=([\d.]+);/).map(Number);
  const ps = attrs(html, /<i class="snap" style="--p:([\d.]+)"><\/i>/g).map(Number);
  assert.deepEqual(ps, [0, ...[0, 1, 2, 3, 4, 5].map(i => +(S0 + (i + .5) * SL / 6).toFixed(2))]);
  assert.match(css, /#contact\{[^}]*height:calc\(100svh - var\(--foot-h/, 'contact and footer share the last screen');
});
