/* HYTEK equipment ↔ software map: renderers (pure, also used by Node tests and the cross-link generator)
   and the 3D picking viewer (HY_EQMAPUI.mount, added below the renderers). Needs eq-map-data.js and site-map.js. */
(function (w) {
  'use strict';
  const D = () => w.HY_EQMAP, SITE = () => w.HY_SITE, EN = () => w.HY_EQMAP_EN || {};
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const page = id => SITE().pages.find(p => p.id === id);
  // i18n: true → markup carries data-i18n (static pages, translated by i18n.js); false → text only (re-rendered on hy:lang)
  const tag = (el, key, text, i18n, attrs = '') => `<${el}${attrs}${i18n ? ` data-i18n="${key}"` : ''}>${esc(text)}</${el}>`;

  const usedBy = protocolId => D().parts.filter(p => p.protocols.includes(protocolId));
  const protocolsOf = partId => (D().parts.find(p => p.id === partId) || { protocols: [] }).protocols;

  function renderPartList(parts, t, i18n = false) {
    return parts.map(p => `<li><button type="button" class="mp-part" data-part="${p.id}" aria-pressed="false">${tag('span', p.key, t(p.key), i18n)}</button></li>`).join('');
  }

  function protoLinks(ids, root, t, i18n) {
    return ids.map(id => { const pg = page(id); return tag('a', pg.key, t(pg.key), i18n, ` class="ul" href="${root}${pg.path}"`); }).join('<span aria-hidden="true"> · </span>');
  }

  function renderPartPanel(part, root, t, i18n = false, more = true) {
    const pg = page(part.page);
    return `<div class="mp-panel" data-part="${part.id}">
  ${tag('h3', part.key, t(part.key), i18n)}
  ${tag('p', `eq.${part.id}.does`, t(`eq.${part.id}.does`), i18n)}
  <dl>
    ${tag('dt', 'eq.lbl.signals', t('eq.lbl.signals'), i18n)}<dd>${part.signals.map(s => tag('span', 'eq.sig.' + s, t('eq.sig.' + s), i18n)).join(' · ')}</dd>
    ${tag('dt', 'eq.lbl.protocols', t('eq.lbl.protocols'), i18n)}<dd>${protoLinks(part.protocols, root, t, i18n)}</dd>
    ${tag('dt', 'eq.lbl.layer', t('eq.lbl.layer'), i18n)}<dd>${tag('span', 'eq.layer.' + part.layer, t('eq.layer.' + part.layer), i18n)}</dd>
    ${tag('dt', 'eq.lbl.example', t('eq.lbl.example'), i18n)}<dd class="ex">${tag('span', part.example, t(part.example), i18n)}</dd>
  </dl>
  ${more ? `<a class="mp-more" href="${root}${pg.path}">${tag('span', 'eq.lbl.more', t('eq.lbl.more'), i18n)}: ${tag('span', pg.key, t(pg.key), i18n)}</a>` : ''}
</div>`;
  }

  // static slot content for protocol pages ("Used by") and equipment pages ("Signals…", "Related protocols")
  function renderUsedBy(protocolId, root, t) {
    return `<ul class="xl">${usedBy(protocolId).map(p => `<li><a class="ul" href="${root}${page(p.page).path}" data-i18n="${p.key}">${esc(t(p.key))}</a> <span class="xl-l" data-i18n="eq.layer.${p.layer}">${esc(t('eq.layer.' + p.layer))}</span></li>`).join('')}</ul>`;
  }
  function renderPagePanels(pageId, root, t) {
    return D().parts.filter(p => p.page === pageId).map(p => renderPartPanel(p, root, t, true, false)).join('\n');
  }
  function renderPageProtocols(pageId, root, t) {
    const ids = [...new Set(D().parts.filter(p => p.page === pageId).flatMap(p => p.protocols))];
    return `<p class="xl">${protoLinks(ids, root, t, true)}</p>`;
  }
  const enT = k => EN()[k] || ((SITE().pages.find(p => p.key === k) || {}).en) || k;

  const api = { usedBy, protocolsOf, renderPartList, renderPartPanel, renderUsedBy, renderPagePanels, renderPageProtocols, enT };
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  w.HY_EQMAPUI = api;
})(typeof window !== 'undefined' ? window : globalThis);
