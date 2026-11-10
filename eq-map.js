/* HYTEK equipment ↔ software map: renderers (pure, also used by Node tests and the cross-link generator)
   and the 3D picking viewer (HY_EQMAPUI.mount, added below the renderers). Needs eq-map-data.js and site-map.js. */
(function (w) {
  'use strict';
  const D = () => w.HY_EQMAP, SITE = () => w.HY_SITE, EN = () => w.HY_EQMAP_EN || {};
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const page = id => SITE().pages.find(p => p.id === id);
  // i18n: true → markup carries data-i18n (static pages, translated by i18n.js); false → text only (re-rendered on hy:lang)
  const tag = (el, key, text, i18n, attrs = '') => `<${el}${attrs}${i18n ? ` data-i18n="${key}"` : ''}>${esc(text)}</${el}>`;

  const usedBy = protocolId => D().parts.filter(p => p.protocols.includes(protocolId));
  const protocolsOf = partId => (D().parts.find(p => p.id === partId) || { protocols: [] }).protocols;

  function renderPartList(parts, t, i18n = false) {
    return parts.map(p => `<li><button type="button" class="mp-part" data-part="${p.id}" aria-pressed="false">${tag('span', p.key, t(p.key), i18n)}</button></li>`).join('');
  }

  function protoLinks(ids, root, t, i18n) {
    return ids.map(id => { const pg = page(id); return tag('a', pg.key, t(pg.key), i18n, ` class="ul" href="${root}${pg.path}"`); }).join('<span aria-hidden="true"> · </span>');
  }

  function renderPartPanel(part, root, t, i18n = false, more = true) {
    const pg = page(part.page);
    return `<div class="mp-panel" data-part="${part.id}">
  ${tag('h3', part.key, t(part.key), i18n)}
  ${tag('p', `eq.${part.id}.does`, t(`eq.${part.id}.does`), i18n)}
  <dl>
    ${tag('dt', 'eq.lbl.signals', t('eq.lbl.signals'), i18n)}<dd>${part.signals.map(s => tag('span', 'eq.sig.' + s, t('eq.sig.' + s), i18n)).join(' · ')}</dd>
    ${tag('dt', 'eq.lbl.protocols', t('eq.lbl.protocols'), i18n)}<dd>${protoLinks(part.protocols, root, t, i18n)}</dd>
    ${tag('dt', 'eq.lbl.layer', t('eq.lbl.layer'), i18n)}<dd>${tag('span', 'eq.layer.' + part.layer, t('eq.layer.' + part.layer), i18n)}</dd>
    ${tag('dt', 'eq.lbl.example', t('eq.lbl.example'), i18n)}<dd class="ex">${tag('span', part.example, t(part.example), i18n)}</dd>
  </dl>
  ${more ? `<a class="mp-more" href="${root}${pg.path}">${tag('span', 'eq.lbl.more', t('eq.lbl.more'), i18n)}: ${tag('span', pg.key, t(pg.key), i18n)}</a>` : ''}
</div>`;
  }

  // static slot content for protocol pages ("Used by") and equipment pages ("Signals…", "Related protocols")
  function renderUsedBy(protocolId, root, t) {
    return `<ul class="xl">${usedBy(protocolId).map(p => `<li><a class="ul" href="${root}${page(p.page).path}" data-i18n="${p.key}">${esc(t(p.key))}</a> <span class="xl-l" data-i18n="eq.layer.${p.layer}">${esc(t('eq.layer.' + p.layer))}</span></li>`).join('')}</ul>`;
  }
  function renderPagePanels(pageId, root, t) {
    return D().parts.filter(p => p.page === pageId).map(p => renderPartPanel(p, root, t, true, false)).join('\n');
  }
  function renderPageProtocols(pageId, root, t) {
    const ids = [...new Set(D().parts.filter(p => p.page === pageId).flatMap(p => p.protocols))];
    return `<p class="xl">${protoLinks(ids, root, t, true)}</p>`;
  }
  const enT = k => EN()[k] || ((SITE().pages.find(p => p.key === k) || {}).en) || k;

  const api = { usedBy, protocolsOf, renderPartList, renderPartPanel, renderUsedBy, renderPagePanels, renderPageProtocols, enT };
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }
  w.HY_EQMAPUI = api;

  /* ---------- clickable 3D map ---------- */
  const PAUSE = '<svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10"/></svg>';
  const PLAY = '<svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l8 5-8 5z"/></svg>';

  function mount(el, opts) {
    const root = opts.root || '', RM = document.documentElement.classList.contains('rm');
    const t = k => (w.HY_T ? w.HY_T(k, enT(k)) : enT(k));
    const parts = D().parts;
    let sel = opts.select || 'process-chamber', paused = false, view3d = null;
    el.classList.add('mp');
    el.innerHTML = `<div class="mp-stage"><div class="mp-gl" role="img"></div><p class="mp-hint"></p></div>
<div class="mp-side"><p class="mp-lbl"></p><ul class="mp-list"></ul><div class="mp-info" aria-live="polite"></div><p class="mp-note"></p></div>`;
    const $ = s => el.querySelector(s), list = $('.mp-list'), info = $('.mp-info'), stage = $('.mp-stage');

    function select(id, from3d) {
      sel = id;
      list.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.part === id)));
      info.innerHTML = renderPartPanel(parts.find(p => p.id === id), root, t);
      if (view3d) view3d.highlight(id);
      if (from3d && innerWidth <= 900) info.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'nearest' });
    }
    function texts() {
      list.innerHTML = renderPartList(parts, t);
      $('.mp-lbl').textContent = t('eq.lbl.parts');
      $('.mp-note').textContent = t('eq.note');
      $('.mp-hint').textContent = t('eq.lbl.pick');
      $('.mp-gl').setAttribute('aria-label', t('eq.note'));
      select(sel);
    }
    list.addEventListener('click', e => { const b = e.target.closest('button[data-part]'); if (b) select(b.dataset.part); });
    addEventListener('hy:lang', texts);
    texts();

    if (!RM) {
      const pb = document.createElement('button'); pb.type = 'button'; pb.className = 'simpause';
      const set = () => { pb.setAttribute('aria-label', paused ? 'Play animation' : 'Pause animation'); pb.innerHTML = paused ? PLAY : PAUSE; };
      set(); pb.onclick = () => { paused = !paused; set(); }; stage.appendChild(pb);
    }
    build3d($('.mp-gl'), stage, { RM, isPaused: () => paused, onPick: id => select(id, true) })
      .then(v => { view3d = v; v.highlight(sel); })
      .catch(e => { console.warn('HYTEK: equipment map 3D unavailable', e); el.classList.add('fail'); });
  }

  async function build3d(host, stage, o) {
    if (!w.HY_EQKIT) throw new Error('eq-kit.js not loaded');
    const THREE = await import('three');
    const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
    const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
    const K = w.HY_EQKIT(THREE), { M, mesh, ink } = K;
    const W = () => host.clientWidth, H = () => host.clientHeight;
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(2, devicePixelRatio)); r.setSize(W(), H()); r.toneMapping = THREE.ACESFilmicToneMapping;
    host.appendChild(r.domElement);
    const scene = new THREE.Scene();
    scene.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), .04).texture;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8fa0b0, 1.5));
    const sun = new THREE.DirectionalLight(0xffffff, 2); sun.position.set(5, 9, 6); scene.add(sun);
    const cam = new THREE.PerspectiveCamera(30, W() / H(), .1, 200);
    const controls = new OrbitControls(cam, r.domElement);
    Object.assign(controls, { enableZoom: false, enablePan: false, enableDamping: !o.RM, dampingFactor: .08, minPolarAngle: .35, maxPolarAngle: 1.3 });

    // high-capacity cluster: 2 loadlocks, 6 process chambers, robot, plus the parts around it
    const world = new THREE.Group(); scene.add(world);
    const groups = {}; // part id → [Object3D]
    const tagPart = (id, g) => { (groups[id] = groups[id] || []).push(g); g.traverse(m => { m.userData.part = id; }); world.add(g); return g; };
    const ap = 1.05, L = w.HY_EQKIT.layoutCluster('hc'), at = (a, d, y = 0) => [Math.cos(a) * d, y, Math.sin(a) * d];
    tagPart('transfer-chamber', K.transferChamber(8, ap, 0));
    const st = {};
    L.forEach(s => {
      const u = s.kind === 'll' ? K.loadlock() : K.processChamber(false), D = ap + (s.kind === 'll' ? .4 : .7);
      u.g.position.set(...at(s.a, D)); u.g.rotation.y = -s.a;
      tagPart(s.kind === 'll' ? 'loadlock' : 'process-chamber', u.g);
      st[s.name] = { a: s.a, D, unit: u };
      if (s.kind === 'pm') { const v = mesh(new THREE.BoxGeometry(.08, .3, .5), M.blue, at(s.a, ap + .05, .46)); v.rotation.y = -s.a; tagPart('gate-valve', v); }
      if (s.kind === 'll') { const c = K.cassette(); c.g.position.set(...at(s.a, D + .85)); c.g.rotation.y = -s.a; tagPart('load-port', c.g); }
    });
    const box = (wd, h, dp, mat, p) => mesh(new THREE.BoxGeometry(wd, h, dp), mat, p);
    const angOf = n => st[n].a;
    { const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(.22, .22, .5, 32), M.dark, [0, .25, 0])); g.add(box(.5, .25, .4, M.frame, [0, .12, .35])); g.position.set(...at(angOf('PM3'), 2.75)); tagPart('vacuum-pump', g); }
    { const g = new THREE.Group(); g.add(box(.55, 1.0, .45, M.frame, [0, .5, 0])); g.add(box(.3, .06, .02, M.blue, [0, .78, .24])); g.position.set(...at(angOf('PM5'), 2.85)); g.rotation.y = -angOf('PM5') + Math.PI / 2; tagPart('gas-mfc', g); }
    { const g = new THREE.Group(); g.add(box(.5, 1.2, .5, M.dark, [0, .6, 0])); for (let i = 0; i < 5; i++) g.add(box(.42, .03, .02, M.black, [0, .35 + i * .14, .26])); g.add(box(.1, .1, .02, M.blue, [.12, 1.05, .26])); g.position.set(...at(angOf('PM4'), 2.85)); g.rotation.y = -angOf('PM4') + Math.PI / 2; tagPart('rf-generator', g); }
    { const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(.03, .03, .5, 12), M.steelD, [0, .25, 0])); g.add(mesh(new THREE.CylinderGeometry(.1, .1, .14, 24), M.steel, [0, .55, 0])); g.add(mesh(new THREE.CylinderGeometry(.07, .07, .02, 24), M.blue, [0, .63, 0])); g.position.set(...at(angOf('PM2'), 2.55)); tagPart('pressure-gauge', g); }
    { const g = new THREE.Group(); g.add(box(.7, 1.5, .5, M.frame, [0, .75, 0])); g.add(box(.5, .34, .02, M.black, [0, 1.15, .26])); g.add(box(.44, .26, .01, M.blue, [0, 1.15, .27])); g.position.set(-2.9, 0, 1.3); g.rotation.y = Math.PI / 3; tagPart('host-link', g); }
    const rob = K.robot(1.75 / 2 + .06); tagPart('wafer-robot', rob.g);
    const wafer = mesh(K.waferGeo, M.wafer); wafer.userData.noEdge = true; world.add(wafer);

    ink(world);
    const hi = {}; for (const id in groups) { hi[id] = new THREE.LineBasicMaterial({ color: K.C.blue, transparent: true, opacity: 0 }); groups[id].forEach(g => ink(g, hi[id])); }
    let selected = null, hover = null;
    const paint = () => { for (const id in hi) hi[id].opacity = id === selected ? .95 : id === hover ? .5 : 0; };

    // camera frames the whole scene
    const sph = new THREE.Box3().setFromObject(world).getBoundingSphere(new THREE.Sphere());
    function frame() { const d = sph.radius / Math.sin((cam.fov * Math.PI / 180) / 2) * (W() / H() < 1 ? 1.15 : W() / H() < 1.5 ? .98 : .74); controls.target.copy(sph.center); cam.position.set(sph.center.x + d * .55, sph.center.y + d * .62, sph.center.z + d * .56); controls.update(); }
    frame();

    // picking: click/tap without drag
    const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
    const pick = e => { const b = r.domElement.getBoundingClientRect(); ptr.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1); ray.setFromCamera(ptr, cam);
      const hit = ray.intersectObjects(world.children, true).find(h => h.object.isMesh && h.object.userData.part); return hit ? hit.object.userData.part : null; };
    let down = null;
    r.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
    r.domElement.addEventListener('pointerup', e => { if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 6) { const id = pick(e); if (id) o.onPick(id); } down = null; });
    r.domElement.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; const id = pick(e); if (id !== hover) { hover = id; r.domElement.style.cursor = id ? 'pointer' : ''; paint(); if (o.RM) draw(); } });
    r.domElement.addEventListener('pointerleave', () => { hover = null; paint(); if (o.RM) draw(); });

    // the one motion: a slow wafer transfer LL-A → PM1 → PM2 → LL-B → back
    const stops = ['LL-A', 'PM1', 'PM2', 'LL-B'].map(n => st[n]);
    const mj = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * x * (10 - 15 * x + 6 * x * x);
    const angDiff = (a, b) => ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    const seq = []; stops.forEach((s, i) => { const n = stops[(i + 1) % stops.length]; seq.push({ k: 'ext', s, d: .9 }, { k: 'pick', s, d: .4 }, { k: 'ret', s, d: .8 }, { k: 'rot', s: n, d: 1.6 }, { k: 'ext', s: n, d: .9 }, { k: 'place', s: n, d: .4 }, { k: 'ret', s: n, d: .8 }, { k: 'wait', d: 1.2 }); });
    let si = 0, tt = 0, theta = stops[0].a, reach = .35, from = { theta, reach }, carry = false;
    const placeAt = s => { const p = s.unit.wafer.clone(); s.unit.g.localToWorld(p); world.worldToLocal(p); wafer.position.copy(p); };
    rob.g.rotation.y = -theta; rob.pose(reach); placeAt(stops[0]);
    if (o.RM) { placeAt(st.PM1); }
    function step(dt) {
      const a = seq[si]; tt += dt / a.d; const k = mj(Math.min(tt, 1));
      if (a.k === 'rot') theta = from.theta + angDiff(from.theta, a.s.a) * k;
      if (a.k === 'ext') reach = from.reach + (a.s.D - from.reach) * k;
      if (a.k === 'ret') reach = from.reach + (.35 - from.reach) * k;
      rob.g.rotation.y = -theta; rob.pose(reach);
      if (carry) { const p = new THREE.Vector3(); rob.tip.getWorldPosition(p); world.worldToLocal(p); wafer.position.copy(p); }
      if (tt >= 1) { if (a.k === 'pick') carry = true; if (a.k === 'place') { carry = false; placeAt(a.s); } si = (si + 1) % seq.length; tt = 0; from = { theta, reach }; }
    }
    function draw() { r.render(scene, cam); }
    let visible = true, last = performance.now();
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '60px' }).observe(host);
    function loop(now) { requestAnimationFrame(loop); const dt = Math.min(.05, (now - last) / 1000); last = now; if (!visible) return; if (!o.isPaused()) step(dt); controls.update(); draw(); }
    if (o.RM) { controls.addEventListener('change', draw); draw(); } else requestAnimationFrame(loop);
    addEventListener('resize', () => { r.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); frame(); if (o.RM) draw(); });
    stage.classList.add('ready');
    return { highlight(id) { selected = id; paint(); if (o.RM) draw(); } };
  }

  w.HY_EQMAPUI.mount = mount;
  if (typeof document !== 'undefined') {
    const go = () => document.querySelectorAll('[data-eqmap]').forEach(el => mount(el, { root: document.documentElement.dataset.root || '', select: el.dataset.select }));
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  }
})(typeof window !== 'undefined' ? window : globalThis);
