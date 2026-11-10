/* SECS-II item and HSMS message decoder (public SEMI E5 / E37 concepts). Pure functions, no DOM.
   Browser: window.HY_SECS. Node: module.exports. */
(function (root) {
  'use strict';
  const FORMATS = {
    0o00: 'L', 0o10: 'B', 0o11: 'BOOLEAN', 0o20: 'A', 0o21: 'J',
    0o30: 'I8', 0o31: 'I1', 0o32: 'I2', 0o34: 'I4', 0o40: 'F8', 0o44: 'F4',
    0o50: 'U8', 0o51: 'U1', 0o52: 'U2', 0o54: 'U4'
  };
  const SIZE = { B: 1, BOOLEAN: 1, A: 1, J: 1, I1: 1, I2: 2, I4: 4, I8: 8, U1: 1, U2: 2, U4: 4, U8: 8, F4: 4, F8: 8 };
  const STYPE = { 0: 'Data', 1: 'Select.req', 2: 'Select.rsp', 3: 'Deselect.req', 4: 'Deselect.rsp',
    5: 'Linktest.req', 6: 'Linktest.rsp', 7: 'Reject.req', 9: 'Separate.req' };
  const MAX_DEPTH = 64;

  function parseHex(text) {
    const clean = String(text).replace(/0x/gi, '').replace(/[\s,;:]+/g, '');
    const bad = clean.match(/[^0-9a-f]/i);
    if (bad) throw new Error(`hex: invalid character "${bad[0]}"`);
    if (clean.length % 2) throw new Error('hex: odd number of digits');
    const out = new Uint8Array(clean.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16);
    return out;
  }

  function need(bytes, end) { if (end > bytes.length) throw new Error(`truncated at byte ${bytes.length}`); }

  function readValues(fmt, bytes, at, len) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset + at, len), n = SIZE[fmt];
    if (len % n) throw new Error(`${fmt} length ${len} is not a multiple of ${n}`);
    if (fmt === 'A') return String.fromCharCode(...bytes.subarray(at, at + len));
    const v = [];
    for (let o = 0; o < len; o += n) {
      switch (fmt) {
        case 'B': case 'J': case 'U1': v.push(dv.getUint8(o)); break;
        case 'BOOLEAN': v.push(dv.getUint8(o) !== 0); break;
        case 'I1': v.push(dv.getInt8(o)); break;
        case 'I2': v.push(dv.getInt16(o)); break;
        case 'I4': v.push(dv.getInt32(o)); break;
        case 'I8': v.push(dv.getBigInt64(o).toString()); break;
        case 'U2': v.push(dv.getUint16(o)); break;
        case 'U4': v.push(dv.getUint32(o)); break;
        case 'U8': v.push(dv.getBigUint64(o).toString()); break;
        case 'F4': v.push(parseFloat(dv.getFloat32(o).toPrecision(7))); break;
        case 'F8': v.push(dv.getFloat64(o)); break;
      }
    }
    return v;
  }

  function decodeItem(bytes, offset = 0, depth = 0) {
    if (depth > MAX_DEPTH) throw new Error(`nesting deeper than ${MAX_DEPTH}`);
    need(bytes, offset + 1);
    const fb = bytes[offset], code = fb >> 2, nlb = fb & 3, fmt = FORMATS[code];
    if (!fmt) throw new Error(`unknown format 0o${code.toString(8).padStart(2, '0')} at byte ${offset}`);
    if (nlb === 0) throw new Error(`no length bytes at byte ${offset}`);
    need(bytes, offset + 1 + nlb);
    let len = 0;
    for (let i = 0; i < nlb; i++) len = len * 256 + bytes[offset + 1 + i];
    let at = offset + 1 + nlb;
    if (fmt === 'L') {
      const items = [];
      for (let i = 0; i < len; i++) { const r = decodeItem(bytes, at, depth + 1); items.push(r.item); at = r.next; }
      return { item: { fmt, value: items }, next: at };
    }
    need(bytes, at + len);
    return { item: { fmt, value: readValues(fmt, bytes, at, len) }, next: at + len };
  }

  function decodeHeader(bytes, offset = 0) {
    need(bytes, offset + 10);
    const b = i => bytes[offset + i];
    const sType = b(5);
    return {
      sessionId: (b(0) << 8) | b(1), wbit: (b(2) & 0x80) !== 0, stream: b(2) & 0x7f, fn: b(3),
      pType: b(4), sType, sTypeName: STYPE[sType] || `SType ${sType}`,
      systemBytes: ((b(6) << 24) >>> 0) + (b(7) << 16) + (b(8) << 8) + b(9)
    };
  }

  function decodeMessage(bytes, opts = {}) {
    const mode = opts.prefix || 'auto';
    let length = null, at = 0;
    if (mode !== 'no' && bytes.length >= 4) {
      const n = ((bytes[0] << 24) >>> 0) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3];
      if (n === bytes.length - 4 && n >= 10) { length = n; at = 4; }
      else if (mode === 'yes') throw new Error(`length prefix says ${n}, data has ${bytes.length - 4}`);
    } else if (mode === 'yes') need(bytes, 4);
    const header = decodeHeader(bytes, at);
    at += 10;
    let body = null;
    if (at < bytes.length) {
      const r = decodeItem(bytes, at);
      body = r.item;
      if (r.next !== bytes.length) throw new Error(`${bytes.length - r.next} extra bytes after the body`);
    }
    const title = header.sType === 0 ? `S${header.stream}F${header.fn}${header.wbit ? ' W' : ''}` : header.sTypeName;
    const sml = header.sType === 0 ? title + '\n' + (body ? toSML(body) + '\n' : '') + '.' : title;
    return { length, header, body, sml };
  }

  function str(s) {
    let out = '';
    for (const ch of s) { const c = ch.charCodeAt(0); out += (c >= 0x20 && c < 0x7f && ch !== '"' && ch !== '\\') ? ch : '\\x' + c.toString(16).padStart(2, '0').toUpperCase(); }
    return '"' + out + '"';
  }

  function toSML(item, indent = 0) {
    const pad = ' '.repeat(indent);
    const { fmt, value } = item;
    if (fmt === 'L') {
      if (!value.length) return `${pad}<L [0]>`;
      return `${pad}<L [${value.length}]\n${value.map(v => toSML(v, indent + 2)).join('\n')}\n${pad}>`;
    }
    if (fmt === 'A') return `${pad}<A ${str(value)}>`;
    let parts;
    if (fmt === 'B' || fmt === 'J') parts = value.map(v => '0x' + v.toString(16).padStart(2, '0').toUpperCase());
    else if (fmt === 'BOOLEAN') parts = value.map(v => (v ? 'TRUE' : 'FALSE'));
    else parts = value.map(String);
    return `${pad}<${fmt}${parts.length ? ' ' + parts.join(' ') : ''}>`;
  }

  const api = { parseHex, decodeItem, decodeHeader, decodeMessage, toSML, FORMATS };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.HY_SECS = api;
})(typeof window !== 'undefined' ? window : globalThis);
