const test = require('node:test'), assert = require('node:assert');
const S = require('../tools/secs-decoder/secs.js'); const h = s => S.parseHex(s);

test('hex parsing', () => {
  assert.deepEqual([...h('0x41, 03 61\n62 63')], [0x41, 3, 0x61, 0x62, 0x63]);
  assert.throws(() => h('4'), /odd number/); assert.throws(() => h('4g'), /invalid character "g"/);
});

test('items to SML', () => {
  const sml = s => S.toSML(S.decodeItem(h(s)).item);
  assert.equal(sml('41 03 61 62 63'), '<A "abc">');
  assert.equal(sml('B1 04 00 00 00 01'), '<U4 1>');
  assert.equal(sml('21 02 0A FF'), '<B 0x0A 0xFF>');
  assert.equal(sml('25 01 01'), '<BOOLEAN TRUE>');
  assert.equal(sml('69 02 FF FE'), '<I2 -2>');
  assert.equal(sml('91 04 3F C0 00 00'), '<F4 1.5>');
  assert.equal(sml('01 02 41 01 58 B1 04 00 00 00 07'), '<L [2]\n  <A "X">\n  <U4 7>\n>');
});

test('empty list and multi-value arrays', () => {
  const sml = s => S.toSML(S.decodeItem(h(s)).item);
  assert.equal(sml('01 00'), '<L [0]>');
  assert.equal(sml('A9 04 00 01 00 02'), '<U2 1 2>');
  assert.equal(sml('A1 08 FF FF FF FF FF FF FF FF'), '<U8 18446744073709551615>');
});

test('HSMS S1F1 W with length prefix, no body', () => {
  const m = S.decodeMessage(h('00 00 00 0A 00 00 81 01 00 00 00 00 00 01'));
  assert.equal(m.length, 10); assert.equal(m.body, null);
  assert.deepEqual([m.header.stream, m.header.fn, m.header.wbit, m.header.systemBytes], [1, 1, true, 1]);
  assert.match(m.sml, /^S1F1 W/);
});

test('data message with body', () => {
  const m = S.decodeMessage(h('00 00 00 0C 00 00 81 0D 00 00 00 00 00 07 01 00'));
  assert.equal(m.sml, 'S1F13 W\n<L [0]>\n.');
});

test('control message name', () => {
  assert.equal(S.decodeHeader(h('FF FF 00 00 00 05 00 00 00 02')).sTypeName, 'Linktest.req');
});

test('bad input fails with a readable error', () => {
  assert.throws(() => S.decodeItem(h('41 05 61')), /truncated at byte/);
  assert.throws(() => S.decodeItem(h('B3 FF FF FF')), /truncated/);          // absurd 3-byte length
  assert.throws(() => S.decodeItem(h('FD 00')), /unknown format/);
  assert.throws(() => S.decodeItem(h('01 01 '.repeat(70) + '01 00')), /deeper than 64/);
  assert.throws(() => S.decodeMessage(h('00 00 00 20 00 00 81 01 00 00 00 00 00 01'), { prefix: 'yes' }), /length prefix says 32/);
  assert.equal(S.decodeMessage(h('00 00 81 01 00 00 00 00 00 01')).header.fn, 1);   // header only, auto
  assert.throws(() => S.decodeMessage(h('00 00 81')), /truncated/);
  assert.throws(() => S.decodeMessage(h('00 00 81 0D 00 00 00 00 00 07 01 00 41')), /extra bytes/);
});
