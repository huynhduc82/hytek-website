// Emulates App Engine's first-match static routing from app.yaml and checks each URL reaches a real file.
const test = require('node:test'), assert = require('node:assert');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const yaml = fs.readFileSync(path.join(ROOT, 'app.yaml'), 'utf8');
const handlers = [...yaml.matchAll(/- url: (\S+)\s*\n\s*static_files: (\S+)/g)].map(m => ({ url: m[1], file: m[2] }));
function route(u) {
  for (const h of handlers) {
    const m = u.match(new RegExp('^' + h.url + '$'));
    if (m) return h.file.replace(/\\(\d)/g, (_, n) => m[+n]);
  }
  return null;
}
for (const u of ['/', '/about/', '/protocols/secs-gem/', '/protocols/secs-gem/index.html', '/tools/secs-decoder/', '/site.js', '/favicon.png', '/lang/vi-hub.js'])
  test('routes ' + u, () => {
    const f = route(u);
    assert.ok(f, 'no handler');
    assert.ok(fs.existsSync(path.join(ROOT, f)), `${u} → ${f}`);
    if (u.endsWith('/')) assert.equal(f, u.slice(1) + 'index.html');
    else assert.equal(f, u.slice(1));
  });
test('pdf and webp are served as static files', () => {
  assert.equal(route('/tools/cheat-sheets/modbus.pdf'), 'tools/cheat-sheets/modbus.pdf');
  assert.equal(route('/og/share.webp'), 'og/share.webp');
});
test('folder URLs without a trailing slash get the slash-adding page, not a broken home page', () => {
  for (const u of ['/about', '/protocols/secs-gem', '/tools', '/old/page']) assert.equal(route(u), 'slash.html', u);
});
test('slash.html adds the slash for known folders and sends anything else home', () => {
  const html = fs.readFileSync(path.join(ROOT, 'slash.html'), 'utf8');
  const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const go = (pathname, search = '', hash = '') => {
    let to = null;
    new Function('location', js)({ pathname, search, hash, origin: 'https://x', replace: u => { to = u; } });
    return to;
  };
  assert.equal(go('/protocols/secs-gem', '?lang=vi', '#a'), '/protocols/secs-gem/?lang=vi#a');
  assert.equal(go('/about'), '/about/');
  assert.equal(go('/old/page'), 'https://x/');
});
test('other unknown files still land on the home page', () => assert.equal(route('/old/page.php'), 'index.html'));
