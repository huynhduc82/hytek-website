const test = require('node:test'), assert = require('node:assert');
const H = require('../protocols/secs-gem/hsms.js');
test('connect → select → linktest → deselect → separate', () => {
  let s = 'NOT_CONNECTED'; const seen = [];
  for (const e of ['connect', 'select', 'linktest', 'deselect', 'separate']) { s = H.next(s, e).state; seen.push(s); }
  assert.deepEqual(seen, ['NOT_SELECTED', 'SELECTED', 'SELECTED', 'NOT_SELECTED', 'NOT_CONNECTED']);
});
test('T7 timeout drops a connection that was never selected', () => assert.equal(H.next('NOT_SELECTED', 't7').state, 'NOT_CONNECTED'));
test('select without a connection is ignored', () => assert.deepEqual(H.next('NOT_CONNECTED', 'select'), { state: 'NOT_CONNECTED', log: 'ignored' }));
test('linktest logs the request/response pair', () => assert.equal(H.next('SELECTED', 'linktest').log, 'Linktest.req / Linktest.rsp'));
test('TCP close always ends in NOT_CONNECTED', () => { for (const s of H.STATES) assert.equal(H.next(s, 'close').state, 'NOT_CONNECTED'); });
