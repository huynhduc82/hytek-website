const test = require('node:test'), assert = require('node:assert');
global.window = {}; require('../site-map.js'); const UI = require('../site.js');
test('header links every section in order, relative to root', () => {
  const h = UI.renderHeader('../../', 'protocols');
  const hrefs = [...h.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  for (const s of window.HY_SITE.sections) assert.ok(hrefs.includes('../../' + s.path), s.path);
  assert.ok(hrefs.includes('mailto:dat.do@hytekvn.com.vn'));
  assert.ok(h.indexOf('hub.nav.equipment') < h.indexOf('hub.nav.protocols'));
  assert.match(h, /aria-current="page"[^>]*data-i18n="hub.nav.protocols"|data-i18n="hub.nav.protocols"[^>]*aria-current="page"/);
  assert.match(h, /data-lang="en"/); assert.match(h, /data-lang="vi"/);
});
test('home header links have no ../', () => assert.doesNotMatch(UI.renderHeader('', null), /href="\.\.\//));
test('footer carries the email and no root-absolute links', () => {
  const f = UI.renderFooter('../');
  assert.match(f, /mailto:dat\.do@hytekvn\.com\.vn/); assert.doesNotMatch(f, /href="\//);
});

test('logo is the only way home: no separate "About HYTEK" item in menu or footer', () => {
  assert.doesNotMatch(UI.renderHeader('', null) + UI.renderFooter(''), /hub\.nav\.about/);
  assert.match(UI.renderHeader('../', null), /class="logo" href="\.\.\/index\.html"/);
});

test('a page can supply its own menu links (landing page: one bar, original anchors + hub)', () => {
  const h = UI.renderHeader('', null, '<a class="ul" href="#about" data-i18n="nav.about">About</a>');
  assert.match(h, /href="#about"/);
  assert.doesNotMatch(h, /hub\.nav\.equipment/);
  assert.equal((h.match(/<nav /g) || []).length, 1);
});

test('a custom (long) menu marks the header so it can fold earlier', () => {
  assert.match(UI.renderHeader('', null, '<a href="#a">A</a>'), /<header class="long">/);
  assert.match(UI.renderHeader('', null), /<header>/);
});
