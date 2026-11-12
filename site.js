/* HYTEK shared shell: header with menu + language switch, footer. Classic script so pages work from file://.
   Load order: lang/*.js, site-map.js, site.js, i18n.js, page scripts. */
(function (w) {
  'use strict';
  const LOGO = '<svg class="mark" viewBox="6 10 100 100" aria-hidden="true"><defs><linearGradient id="lgb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b5cab"/><stop offset="1" stop-color="#1688dc"/></linearGradient></defs><rect x="6" y="10" width="100" height="100" rx="24" fill="url(#lgb)"/><g fill="#fff"><path d="M28 30h13v60H28zM71 30h13v60H71z"/><rect x="41" y="49" width="12" height="14" rx="1"/><rect x="53" y="42" width="19" height="28" rx="4" fill="#0b5cab" stroke="#fff" stroke-width="4"/><path d="M62.5 47l6 9-6 9-6-9z"/><rect x="55" y="36" width="3" height="6"/><rect x="62" y="36" width="3" height="6"/><rect x="69" y="36" width="3" height="6"/><rect x="55" y="70" width="3" height="6"/><rect x="62" y="70" width="3" height="6"/><rect x="69" y="70" width="3" height="6"/></g><g fill="none" stroke="#fff" stroke-width="2" opacity=".85"><path d="M16 46h12M84 46h12M16 74h12M84 74h12"/></g></svg><span class="wm"><b>HYTEK</b><small>Semiconductor Equipment Software</small></span>';
  const EN = {
    'hub.nav.equipment': 'Equipment', 'hub.nav.protocols': 'Protocols', 'hub.nav.tools': 'Tools',
    'hub.nav.learn': 'Learn', 'hub.nav.contact': 'Contact'
  };

  // two languages: one button naming the other language in its own words (US Web Design System pattern); i18n.js
  // sets its text, lang and target on every switch. The globe is the common sign for "language" worldwide.
  const GLOBE = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.3"/><path d="M1.7 8h12.6M8 1.7c-2 2.2-2 10.4 0 12.6M8 1.7c2 2.2 2 10.4 0 12.6"/></svg>';
  const LANG = '<button type="button" class="lang" data-lang="vi" title="Tiếng Việt">' + GLOBE + '<span lang="vi">Tiếng Việt</span></button>';

  // custom: a page's own menu links (the landing page keeps its original in-page menu).
  // Contact is the header's one filled button and never folds away; the menu sits right, next to it; the language
  // button stands alone just before Contact (on phones: the globe only).
  function renderHeader(root, current, custom) {
    const S = w.HY_SITE;
    let links, cta;
    if (custom != null) {
      const m = custom.match(/<a\b[^>]*\bclass="[^"]*\bcta\b[^"]*"[^>]*>[\s\S]*?<\/a>/);
      cta = m ? m[0].replace(/class="[^"]*"/, 'class="hcta"') : '';
      links = m ? custom.replace(m[0], '') : custom;
    } else {
      links = S.sections.map(s => `<a class="ul" href="${root}${s.path}"${s.id === current ? ' aria-current="page"' : ''} data-i18n="${s.key}">${EN[s.key]}</a>`).join('');
      cta = `<a class="hcta" href="${root}contact/index.html" data-i18n="hub.nav.contact">${EN['hub.nav.contact']}</a>`;
    }
    return `<header${custom != null ? ' class="long"' : ''}>
  <a class="logo" href="${root}index.html" aria-label="HYTEK home" data-i18n-aria="ui.home">${LOGO}</a>
  <nav id="nav">${links}</nav>
  <div class="hright">
    ${LANG}
    ${cta}
    <button class="menu" type="button" aria-expanded="false" aria-controls="nav" data-i18n="ui.menu">Menu</button>
  </div>
</header>`;
  }

  function renderFooter(root) {
    const S = w.HY_SITE;
    return `<footer class="foot">
  <div><b>HYTEK</b><span data-i18n="brand.tag">Engineering Software for Advanced Thin Film Systems</span></div>
  <a class="ul" href="mailto:${S.email}">${S.email}</a>
  <span>© 2026 HYTEK SOLUTIONS VN COMPANY LIMITED</span>
</footer>`;
  }

  const api = { renderHeader, renderFooter };
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  w.HY_SITE_UI = api;
  if (typeof document === 'undefined') return;

  const de = document.documentElement, root = de.dataset.root || '';
  const hh = document.getElementById('hy-header'), hf = document.getElementById('hy-footer');
  const tpl = document.getElementById('hy-nav');
  if (hh) hh.outerHTML = renderHeader(root, document.body.dataset.section || null, tpl ? tpl.innerHTML.trim() : null);
  if (hf) hf.outerHTML = renderFooter(root);
  const foot = document.querySelector('footer.foot'); // the last screen holds the contact section and this footer
  if (foot) { const fh = () => de.style.setProperty('--foot-h', foot.offsetHeight + 'px'); fh(); if (w.ResizeObserver) new ResizeObserver(fh).observe(foot); }

  const b = document.querySelector('header .menu'), n = document.getElementById('nav');
  if (b && n) {
    const T = (k, en) => (w.HY_T ? w.HY_T(k, en) : en);
    const close = () => { n.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); b.textContent = T('ui.menu', 'Menu'); };
    b.addEventListener('click', () => { const o = n.classList.toggle('open'); b.setAttribute('aria-expanded', o); b.textContent = o ? T('ui.close', 'Close') : T('ui.menu', 'Menu'); });
    document.querySelectorAll('header nav a, header .hcta').forEach(a => a.addEventListener('click', close));
  }

  const TT = (k, en) => (w.HY_T ? w.HY_T(k, en) : en);
  // Contact from an article: the contact page learns which page the visitor was reading
  const pageId = document.body.dataset.page, hc = document.querySelector('header .hcta');
  if (hc && pageId && pageId !== 'contact' && /contact\/index\.html$/.test(hc.getAttribute('href'))) hc.setAttribute('href', hc.getAttribute('href') + '?from=' + encodeURIComponent(pageId));
  if (document.body.dataset.section === 'contact') {
    const from = new URLSearchParams(location.search).get('from'), pg = from && w.HY_SITE.pages.find(p => p.id === from);
    if (pg) {
      const btn = document.querySelector('.contact .card .btn'), back = document.querySelector('.contact .from'), nm = back && back.querySelector('.from-name');
      if (btn) btn.setAttribute('href', 'mailto:' + w.HY_SITE.email + '?subject=' + encodeURIComponent('HYTEK ' + pg.en));
      if (back && nm) { back.setAttribute('href', root + pg.path); nm.textContent = pg.en; nm.setAttribute('data-i18n', pg.key); back.hidden = false; }
    }
  }
  // "Copy email": the address reaches people without a mail program (webmail desks)
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-copy]'); if (!b) return;
    const text = b.dataset.copy, live = b.parentNode.querySelector('[role="status"]');
    const done = () => {
      b.dataset.done = ''; b.textContent = TT('ui.copied', 'Copied'); if (live) live.textContent = TT('ui.copied', 'Copied') + ': ' + text;
      clearTimeout(b._t); b._t = setTimeout(() => { delete b.dataset.done; b.textContent = TT('ui.copy', 'Copy email'); }, 1800);
    };
    const fallback = () => { const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select(); try { if (document.execCommand('copy')) done(); } catch (_) {} ta.remove(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  });

  // In-page links land on the section's first label or heading, 40px under the fixed header. Sections carry 128px of
  // top padding (and About centres its content), so aligning the section box itself left the heading ~140px down.
  // A long trip jumps most of the way and glides only the last screen, and never glides through a [data-scroll-skip]
  // region (the landing's scroll-driven chamber, which would take itself apart and back on the way).
  const GAP = 40, RMq = matchMedia('(prefers-reduced-motion: reduce)');
  const landing = el => { // where the page stops on whole screens, a section lands on its own stop
    if (snapping() && /start/.test(getComputedStyle(el).scrollSnapAlign)) return Math.round(el.getBoundingClientRect().top + scrollY);
    const first = el.querySelector('.sheet, h2, h1') || el; const hd = document.querySelector('header');
    return Math.max(0, first.getBoundingClientRect().top + scrollY - (hd ? hd.getBoundingClientRect().bottom : 0) - GAP); };
  function travel(y1) {
    const y0 = scrollY, dir = Math.sign(y1 - y0), vh = innerHeight;
    if (RMq.matches || !dir) { scrollTo({ top: y1, behavior: 'instant' }); return; }
    let pre = Math.abs(y1 - y0) > 1.5 * vh ? y1 - dir * vh : y0;
    for (const s of document.querySelectorAll('[data-scroll-skip]')) {
      const r = s.getBoundingClientRect(), a = r.top + y0 - vh, b = r.bottom + y0 - vh; // scroll range where it is on screen and animating
      if (dir > 0 && pre < b && y1 > b) pre = Math.max(pre, b);
      if (dir < 0 && pre > a && y1 < r.top + y0) pre = Math.min(pre, r.top + y0);
    }
    // wheel stops (scroll-snap) would catch the jump half way: pause them for the trip, the landing is a stop anyway
    de.classList.add('no-snap'); clearTimeout(travel.t);
    const resume = () => { clearTimeout(travel.t); removeEventListener('scrollend', resume); de.classList.remove('no-snap'); };
    if ('onscrollend' in w) addEventListener('scrollend', resume); travel.t = setTimeout(resume, 1500);
    if (pre !== y0) scrollTo({ top: pre, behavior: 'instant' });
    scrollTo({ top: y1, behavior: 'smooth' });
  }
  const target = hash => { try { return hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null; } catch (e) { return null; } };
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // a page script may own the link
    const el = target(a.getAttribute('href')); if (!el) return;
    e.preventDefault();
    travel(landing(el));
    if (history.pushState) history.pushState(null, '', a.getAttribute('href'));
  });
  // Wheel and trackpad, where the page stops on whole screens (scroll-snap, desktop landing): one gesture moves one
  // stop. Browsers differ on how a wheel tick meets mandatory snapping (some snap back to where they started), so the
  // step is taken here; keyboard, scrollbar and touch keep the browser's own snapping.
  const snapping = () => !de.classList.contains('no-snap') && !de.classList.contains('snap-off') && /^y/.test(getComputedStyle(de).scrollSnapType || '');
  // a screen too small for some section (very short or narrow windows): scroll freely, so nothing is cut off between stops
  const fits = () => { de.classList.remove('snap-off'); if ([...document.querySelectorAll('main > section')].some(s => s.scrollHeight > innerHeight + 1)) de.classList.add('snap-off'); };
  if (document.getElementById('stage')) { addEventListener('load', fits); let rt = 0; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fits, 150); }); addEventListener('hy:lang', fits); }
  const stops = () => {
    const max = de.scrollHeight - innerHeight;
    const ys = [...document.querySelectorAll('main > *, #stage .snap')].filter(el => /start/.test(getComputedStyle(el).scrollSnapAlign))
      .map(el => Math.min(max, Math.round(el.getBoundingClientRect().top + scrollY)));
    ys.push(max); return [...new Set(ys)].sort((a, b) => a - b);
  };
  let busy = false, quietAt = 0, acc = 0, lastEv = 0, endT = 0;
  const done = () => { busy = false; clearTimeout(endT); removeEventListener('scrollend', done); };
  addEventListener('wheel', e => {
    if (e.defaultPrevented || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || !snapping()) return;
    for (let n = e.target; n && n.nodeType === 1 && n !== document.body; n = n.parentElement) // a box that scrolls itself keeps the wheel
      if (n.scrollHeight > n.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(n).overflowY)) return;
    const now = performance.now(), dy = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY;
    if (busy || now < quietAt) { e.preventDefault(); quietAt = now + 200; return; } // the rest of the same gesture (trackpad momentum)
    if (now - lastEv > 250 || Math.sign(dy) !== Math.sign(acc)) acc = 0;
    lastEv = now; acc += dy;
    const ys = stops(), y = scrollY, dir = Math.sign(acc);
    const next = dir > 0 ? ys.find(s => s > y + 2) : ys.slice().reverse().find(s => s < y - 2);
    if (next == null) return; // the top or the bottom of the page
    e.preventDefault();
    if (Math.abs(acc) < 24) return; // a light touch on a trackpad is not a step yet
    acc = 0; busy = true; quietAt = now + 200;
    if ('onscrollend' in w) addEventListener('scrollend', done); endT = setTimeout(done, 1000);
    scrollTo({ top: next, behavior: RMq.matches ? 'instant' : 'smooth' });
  }, { passive: false });

  // a page opened at #section lands the same way once its layout has settled
  const toHash = () => {
    const el = target(location.hash); if (!el) return;
    const own = el.closest('[data-scroll-skip]') && document.querySelector('a[href="' + location.hash + '"]');
    if (own) { own.click(); return; } // a link the page script places itself (#services → the first step of the chamber)
    scrollTo({ top: landing(el), behavior: 'instant' });
  };
  if (location.hash) addEventListener('load', () => setTimeout(toHash, 60)); // after the browser's own fragment scroll
  addEventListener('hashchange', toHash); // a #section typed into the address bar

  // the menu item of the section on screen keeps its hover underline (aria-current="location")
  const spy = [...document.querySelectorAll('header nav a[href^="#"]')].map(a => ({ a, el: target(a.getAttribute('href')) })).filter(x => x.el);
  if (spy.length) {
    let cur = null, queued = false;
    const pick = () => {
      queued = false;
      const hd = document.querySelector('header'), probe = (hd ? hd.getBoundingClientRect().bottom : 0) + innerHeight * .3;
      let on = null;
      for (const x of spy) {
        const r = x.el.getBoundingClientRect();
        const box = x.el.closest('[data-scroll-skip]'); // a part of the scroll-driven stage: the stage's box decides, while it is shown
        const b = box ? box.getBoundingClientRect() : r;
        if (b.top <= probe && b.bottom > probe && (!box || +getComputedStyle(x.el).opacity > .5)) on = x;
      }
      if (on === cur) return; cur = on;
      spy.forEach(x => { x.a.classList.toggle('on', x === on); if (x === on) x.a.setAttribute('aria-current', 'location'); else x.a.removeAttribute('aria-current'); });
    };
    const ask = () => { if (!queued) { queued = true; requestAnimationFrame(pick); } };
    addEventListener('scroll', ask, { passive: true }); addEventListener('resize', ask); addEventListener('load', ask); ask();
  }
})(typeof window !== 'undefined' ? window : globalThis);
