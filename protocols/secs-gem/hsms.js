/* HSMS connection states (public SEMI E37 concepts), seen from the passive side (the equipment).
   HY_HSMS.next(state, event) is pure; the small simulator below drives #hsmsSim when present. */
(function (w) {
  'use strict';
  const STATES = ['NOT_CONNECTED', 'NOT_SELECTED', 'SELECTED'];
  const T = {
    NOT_CONNECTED: { connect: ['NOT_SELECTED', 'TCP connected · T7 started'] },
    NOT_SELECTED: { select: ['SELECTED', 'Select.req / Select.rsp'], linktest: ['NOT_SELECTED', 'Linktest.req / Linktest.rsp'], t7: ['NOT_CONNECTED', 'T7 timeout · TCP closed'], separate: ['NOT_CONNECTED', 'Separate.req'] },
    SELECTED: { linktest: ['SELECTED', 'Linktest.req / Linktest.rsp'], deselect: ['NOT_SELECTED', 'Deselect.req / Deselect.rsp'], separate: ['NOT_CONNECTED', 'Separate.req'] }
  };
  function next(state, event) {
    if (event === 'close' && state !== 'NOT_CONNECTED') return { state: 'NOT_CONNECTED', log: 'TCP closed' };
    const t = (T[state] || {})[event];
    return t ? { state: t[0], log: t[1] } : { state, log: 'ignored' };
  }
  const api = { next, STATES };
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  w.HY_HSMS = api;

  const el = document.getElementById('hsmsSim'); if (!el) return;
  const tr = (k, en) => (w.HY_T ? w.HY_T(k, en) : en);
  let state = 'NOT_CONNECTED';
  const log = el.querySelector('.hs-log');
  function show() {
    el.querySelectorAll('[data-state]').forEach(n => n.classList.toggle('on', n.dataset.state === state));
    el.querySelectorAll('button[data-ev]').forEach(b => { b.disabled = b.dataset.ev !== 'reset' && next(state, b.dataset.ev).log === 'ignored'; });
  }
  el.addEventListener('click', e => {
    const b = e.target.closest('button[data-ev]'); if (!b) return;
    if (b.dataset.ev === 'reset') { state = 'NOT_CONNECTED'; log.innerHTML = ''; show(); return; }
    const r = next(state, b.dataset.ev); state = r.state;
    const li = document.createElement('li'); li.textContent = r.log; log.prepend(li);
    while (log.children.length > 6) log.lastChild.remove();
    show();
    const f = el.querySelector('button[data-ev]:not(:disabled)'); if (b.disabled && f) f.focus();
  });
  show();
})(typeof window !== 'undefined' ? window : globalThis);
