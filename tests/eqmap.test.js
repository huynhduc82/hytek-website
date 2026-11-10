const test = require('node:test'), assert = require('node:assert');
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const ctx = { window: {} }; vm.createContext(ctx);
for (const f of ['site-map.js', 'eq-map-data.js', 'lang/vi-eqmap.js', 'lang/vi-hub.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx);
const { HY_SITE, HY_EQMAP, HY_EQMAP_EN, HY_VI } = ctx.window;
global.window = { HY_SITE, HY_EQMAP, HY_EQMAP_EN };
const UI = require('../eq-map.js');
const pageIds = new Set(HY_SITE.pages.map(p => p.id));
const protocolPages = HY_SITE.pages.filter(p => p.section === 'protocols').map(p => p.id);
const t = k => HY_EQMAP_EN[k] || (HY_SITE.pages.find(p => p.key === k) || {}).en || k;

test('every part links to existing protocol and equipment pages', () => {
  for (const p of HY_EQMAP.parts) {
    assert.ok(pageIds.has(p.page) && HY_SITE.pages.find(x => x.id === p.page).section === 'equipment', p.id + ' page');
    for (const pr of p.protocols) assert.ok(protocolPages.includes(pr), `${p.id} → ${pr}`);
    assert.ok(['driver', 'sequence', 'interlock', 'gem'].includes(p.layer), p.id + ' layer');
    for (const s of p.signals) assert.ok(['digital', 'analog', 'serial', 'network'].includes(s), p.id + ' signal ' + s);
  }
});

test('every protocol page is used by at least one part', () => {
  for (const pr of protocolPages) assert.ok(UI.usedBy(pr).length > 0, pr);
});

test('usedBy and protocolsOf agree', () => {
  assert.ok(UI.usedBy('secs-gem').some(p => p.id === 'host-link'));
  assert.deepEqual(UI.protocolsOf('host-link'), HY_EQMAP.parts.find(p => p.id === 'host-link').protocols);
});

test('list renders without 3D', () => {
  const html = UI.renderPartList(HY_EQMAP.parts, t);
  assert.equal((html.match(/<button/g) || []).length, HY_EQMAP.parts.length);
  for (const p of HY_EQMAP.parts) assert.match(html, new RegExp(`data-part="${p.id}"`));
});

test('panel links are relative and end in index.html', () => {
  const html = UI.renderPartPanel(HY_EQMAP.parts.find(p => p.id === 'gas-mfc'), '../', t);
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  assert.ok(hrefs.length >= 2);
  for (const h of hrefs) assert.match(h, /^\.\.\/[a-z-]+\/[a-z0-9-]+\/index\.html$/);
});

test('every eq.* key has EN and VI', () => {
  const keys = Object.keys(HY_EQMAP_EN);
  for (const p of HY_EQMAP.parts) for (const k of ['name', 'does', 'ex']) assert.ok(keys.includes(`eq.${p.id}.${k}`), `eq.${p.id}.${k}`);
  for (const k of keys) assert.ok(HY_VI[k] != null, 'VI ' + k);
});

test('no real identifiers in examples (invented, generic only)', () => {
  for (const [k, v] of Object.entries(HY_EQMAP_EN)) assert.doesNotMatch(v, /\b(CEID|SVID|ALID|VID)\s*\d/i, k);
});

test('panels on their own equipment page do not link back to that page', () => {
  const html = UI.renderPagePanels('vacuum-gas', '../../', t);
  assert.doesNotMatch(html, /mp-more/);
  assert.match(UI.renderPartPanel(HY_EQMAP.parts[0], '', t), /mp-more/);
});
