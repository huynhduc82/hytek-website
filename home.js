/* HYTEK home page: renders the numbered challenge / ask-an-engineer feed from data/feed.js (hidden when empty). */
(function (w) {
  'use strict';
  const KIND = { challenge: ['feed.kind.challenge', 'Challenge'], ask: ['feed.kind.ask', 'Ask an engineer'] };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const label = (e, t) => `${t(...KIND[e.kind])} #${e.no} · ${e.date}`;
  function renderFeed(items, root, t) {
    return items.map(e => `<li><a href="${root}${e.page}"><span class="fd-k">${esc(label(e, t))}</span><b>${esc(t(e.titleKey, e.title))}</b></a></li>`).join('');
  }
  const api = { label, renderFeed };
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  w.HY_FEEDUI = api;
  const box = document.getElementById('feed'), list = box && box.querySelector('ul');
  if (!list) return;
  const t = (k, en) => (w.HY_T ? w.HY_T(k, en) : en);
  const draw = () => { const items = w.HY_FEED || []; list.innerHTML = renderFeed(items, '', t); box.hidden = !items.length; };
  addEventListener('hy:lang', draw); draw();
})(typeof window !== 'undefined' ? window : globalThis);
