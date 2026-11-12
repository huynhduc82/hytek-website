/* SECS-II / HSMS decoder page: decodes as you type; errors are shown, never thrown. */
(function () {
  'use strict';
  const S = window.HY_SECS, $ = id => document.getElementById(id);
  const T = (k, en) => (window.HY_T ? window.HY_T(k, en) : en);
  const inp = $('hexIn'), err = $('decErr'), head = $('decHead'), out = $('smlOut');
  if (!S || !inp) return;
  const EX = {
    s1f13: '00 00 00 0C 00 01 81 0D 00 00 00 00 00 01\n01 00',
    s6f11: '00 00 00 30 00 01 86 0B 00 00 00 00 00 02\n01 03 B1 04 00 00 00 01 B1 04 00 00 03 E9\n01 01 01 02 B1 04 00 00 00 01\n01 02 41 04 49 44 4C 45 91 04 41 B4 00 00',
    link: '00 00 00 0A FF FF 00 00 00 05 00 00 00 03'
  };
  // decoder error → a plain heading, plus the detail (byte position, counts) in brackets, in the page language
  const ERR = [[/^hex: odd/, 'dec.e.odd', 'Odd number of hex digits'], [/^hex: invalid/, 'dec.e.char', 'Not a hex character'],
    [/^truncated/, 'dec.e.trunc', 'Data ends too early'], [/^unknown format/, 'dec.e.fmt', 'Invalid format byte'],
    [/^nesting/, 'dec.e.deep', 'Lists nested too deeply'], [/^length prefix/, 'dec.e.prefix', 'Length prefix does not match the data'],
    [/extra bytes/, 'dec.e.extra', 'Extra bytes after the body'], [/not a multiple|no length bytes/, 'dec.e.len', 'Invalid item length']];
  const DETAIL = [[/^truncated at byte (\d+)$/, 'at byte $1', 'tại byte $1'], [/^hex: invalid character "(.+)"$/, 'character "$1"', 'ký tự "$1"'],
    [/^hex: odd number of digits$/, '', ''],
    [/^(\S+) length (\d+) is not a multiple of (\d+)$/, '$1 is $2 bytes, not a multiple of $3', '$1 dài $2 byte, không chia hết cho $3'],
    [/^nesting deeper than (\d+)$/, 'more than $1 levels', 'quá $1 tầng'], [/^unknown format (0o\d+) at byte (\d+)$/, '$1 at byte $2', '$1 tại byte $2'],
    [/^no length bytes at byte (\d+)$/, 'no length bytes at byte $1', 'thiếu byte độ dài tại byte $1'],
    [/^length prefix says (\d+), data has (\d+)$/, 'prefix says $1, data has $2 bytes', 'tiền tố ghi $1, dữ liệu có $2 byte'],
    [/^(\d+) extra bytes after the body$/, '$1 bytes', '$1 byte thừa']];
  const detail = msg => { const d = DETAIL.find(([re]) => re.test(msg)); return d ? msg.replace(d[0], window.HY_LANG === 'vi' ? d[2] : d[1]) : msg; };
  let last = null;

  function showError(e) {
    const m = ERR.find(([re]) => re.test(e.message));
    const msg = m ? T(m[1], m[2]) : '', d = detail(e.message);
    err.textContent = msg ? (d ? `${msg} (${d})` : msg) : e.message;
    err.hidden = false; head.hidden = true; out.textContent = '';
  }
  function hex(n, w) { return '0x' + n.toString(16).toUpperCase().padStart(w, '0'); }

  function run() {
    last = null;
    const text = inp.value.trim();
    err.hidden = true;
    if (!text) { head.hidden = true; out.textContent = ''; return; }
    const mode = document.querySelector('input[name="prefix"]:checked').value;
    try {
      const bytes = S.parseHex(text);
      if (mode === 'item') {
        const r = S.decodeItem(bytes);
        if (r.next !== bytes.length) throw new Error(`${bytes.length - r.next} extra bytes after the body`);
        head.hidden = true; out.textContent = S.toSML(r.item); return;
      }
      const m = S.decodeMessage(bytes, { prefix: mode }), h = m.header;
      last = m;
      $('hMsg').textContent = h.sType === 0 ? `S${h.stream}F${h.fn}${h.wbit ? ' · W' : ''}` : h.sTypeName;
      $('hLen').textContent = m.length == null ? '—' : m.length + ' B';
      $('hSes').textContent = hex(h.sessionId, 4);
      $('hType').textContent = `${h.pType} · ${h.sType} (${h.sTypeName})`;
      $('hSys').textContent = hex(h.systemBytes, 8);
      head.hidden = false; out.textContent = m.sml;
    } catch (e) { showError(e); }
  }

  let timer = 0;
  inp.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 150); });
  document.querySelectorAll('input[name="prefix"]').forEach(r => r.addEventListener('change', run));
  document.querySelectorAll('[data-ex]').forEach(b => b.addEventListener('click', () => {
    inp.value = EX[b.dataset.ex];
    document.querySelector('input[name="prefix"][value="auto"]').checked = true;
    run(); inp.focus();
  }));
  addEventListener('hy:lang', run);
  inp.value = EX.s6f11; run();
})();
