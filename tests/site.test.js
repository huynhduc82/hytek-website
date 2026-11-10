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
const pages = files.filter(f => f.endsWith('.html'));
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

test('every data-i18n key has VI', () => {
  const shellKeys = attrs(UI.renderHeader('', null) + UI.renderFooter(''), /data-i18n="([^"]+)"/g);
  for (const f of pages) {
    const html = read(f), ctx = { window: {} };
    vm.createContext(ctx);
    for (const s of localScripts(html).filter(x => x.replace(/^(\.\.\/)+/, '').startsWith('lang/')))
      vm.runInContext(read(path.join(path.dirname(f), s)), ctx);
    const VI = ctx.window.HY_VI || {};
    const keys = [...attrs(html, /data-i18n(?:-content)?="([^"]+)"/g), ...(html.includes('id="hy-header"') ? shellKeys : [])];
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
    const s = read(f);
    assert.doesNotMatch(s, /TODO|provisional|chém|\bowner\b/i, rel(f));
    assert.doesNotMatch(s, /\bNDA\b/, rel(f));
  }
});

test('old anchors are redirected by site.js', () => {
  for (const id of ['stage', 'about', 'equipment', 'services', 'protocols', 'gem', 'simulator', 'partnership', 'contact'])
    assert.ok(UI.OLD.includes(id), id);
});
