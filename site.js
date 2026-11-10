/* HYTEK shared shell: header with menu + language switch, footer. Classic script so pages work from file://.
   Load order: lang/*.js, site-map.js, site.js, i18n.js, page scripts. */
(function (w) {
  'use strict';
  const LOGO = '<svg class="mark" viewBox="6 10 100 100" aria-hidden="true"><defs><linearGradient id="lgb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b5cab"/><stop offset="1" stop-color="#1688dc"/></linearGradient></defs><rect x="6" y="10" width="100" height="100" rx="24" fill="url(#lgb)"/><g fill="#fff"><path d="M28 30h13v60H28zM71 30h13v60H71z"/><rect x="41" y="49" width="12" height="14" rx="1"/><rect x="53" y="42" width="19" height="28" rx="4" fill="#0b5cab" stroke="#fff" stroke-width="4"/><path d="M62.5 47l6 9-6 9-6-9z"/><rect x="55" y="36" width="3" height="6"/><rect x="62" y="36" width="3" height="6"/><rect x="69" y="36" width="3" height="6"/><rect x="55" y="70" width="3" height="6"/><rect x="62" y="70" width="3" height="6"/><rect x="69" y="70" width="3" height="6"/></g><g fill="none" stroke="#fff" stroke-width="2" opacity=".85"><path d="M16 46h12M84 46h12M16 74h12M84 74h12"/></g></svg><span class="wm"><b>HYTEK</b><small>Semiconductor Equipment Software</small></span>';
  const EN = {
    'hub.nav.equipment': 'Equipment', 'hub.nav.protocols': 'Protocols', 'hub.nav.tools': 'Tools',
    'hub.nav.learn': 'Learn', 'hub.nav.about': 'About HYTEK', 'hub.nav.contact': 'Contact'
  };
  // the old one-page site's anchors; bookmarks like index.html#protocols are sent to the About page
  const OLD = ['stage', 'about', 'equipment', 'services', 'protocols', 'gem', 'simulator', 'partnership', 'contact'];

  function renderHeader(root, current) {
    const S = w.HY_SITE;
    const links = S.sections.map(s => `<a class="ul" href="${root}${s.path}"${s.id === current ? ' aria-current="page"' : ''} data-i18n="${s.key}">${EN[s.key]}</a>`).join('');
    return `<header>
  <a class="logo" href="${root}index.html" aria-label="HYTEK home">${LOGO}</a>
  <nav id="nav">${links}<a class="ul cta" href="mailto:${S.email}" data-i18n="hub.nav.contact">${EN['hub.nav.contact']}</a></nav>
  <div class="hright">
    <div class="lang" role="group" aria-label="Language"><button type="button" data-lang="en" aria-pressed="true">EN</button><button type="button" data-lang="vi" aria-pressed="false">VI</button></div>
    <button class="menu" type="button" aria-expanded="false" aria-controls="nav" data-i18n="ui.menu">Menu</button>
  </div>
</header>`;
  }

  function renderFooter(root) {
    const S = w.HY_SITE;
    return `<footer class="foot">
  <div><b>HYTEK</b><span data-i18n="brand.tag">Engineering Software for Advanced Thin Film Systems</span></div>
  <a class="ul" href="mailto:${S.email}">${S.email}</a>
  <a class="ul" href="${root}about/index.html" data-i18n="hub.nav.about">${EN['hub.nav.about']}</a>
  <span>© 2026 HYTEK SOLUTIONS VN COMPANY LIMITED</span>
</footer>`;
  }

  const api = { renderHeader, renderFooter, OLD };
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  w.HY_SITE_UI = api;
  if (typeof document === 'undefined') return;

  const de = document.documentElement, root = de.dataset.root || '';
  if (de.dataset.home === '1' && OLD.includes(location.hash.slice(1))) { location.replace('about/index.html' + location.hash); return; }
  const hh = document.getElementById('hy-header'), hf = document.getElementById('hy-footer');
  if (hh) hh.outerHTML = renderHeader(root, document.body.dataset.section || null);
  if (hf) hf.outerHTML = renderFooter(root);

  const b = document.querySelector('header .menu'), n = document.getElementById('nav');
  if (b && n) {
    const T = (k, en) => (w.HY_T ? w.HY_T(k, en) : en);
    const close = () => { n.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); b.textContent = T('ui.menu', 'Menu'); };
    b.addEventListener('click', () => { const o = n.classList.toggle('open'); b.setAttribute('aria-expanded', o); b.textContent = o ? T('ui.close', 'Close') : T('ui.menu', 'Menu'); });
    n.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  }
})(typeof window !== 'undefined' ? window : globalThis);
