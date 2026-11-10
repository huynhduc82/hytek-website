const test = require('node:test'), assert = require('node:assert');
global.window = {};
const F = require('../home.js');
const t = (k, en) => en;
test('feed entries are labelled by number and month, never "this week"', () => {
  assert.equal(F.label({ kind: 'challenge', no: 1, date: '2026-11' }, t), 'Challenge #1 · 2026-11');
  assert.equal(F.label({ kind: 'ask', no: 3, date: '2026-12' }, t), 'Ask an engineer #3 · 2026-12');
});
test('empty feed renders nothing', () => assert.equal(F.renderFeed([], '', t), ''));
test('feed items link to their page relative to root', () => {
  const html = F.renderFeed([{ kind: 'challenge', no: 1, date: '2026-11', titleKey: 'feed.c1', title: 'Decode this message', page: 'learn/challenge/index.html' }], '', t);
  assert.match(html, /href="learn\/challenge\/index\.html"/);
  assert.match(html, /Decode this message/);
  assert.doesNotMatch(html, /this week/i);
});
