/* HYTEK site registry: menu sections and every page of the hub. Paths are relative to the site root. */
(function (w) {
  const P = (section, id, kind) => ({ id, section, kind, path: section + '/' + id + '/index.html', key: 'hub.pg.' + id });
  w.HY_SITE = {
    sections: [
      { id: 'equipment', path: 'equipment/index.html', key: 'hub.nav.equipment' },
      { id: 'protocols', path: 'protocols/index.html', key: 'hub.nav.protocols' },
      { id: 'tools', path: 'tools/index.html', key: 'hub.nav.tools' },
      { id: 'learn', path: 'learn/index.html', key: 'hub.nav.learn' },
      { id: 'about', path: 'about/index.html', key: 'hub.nav.about' }
    ],
    pages: [
      P('equipment', 'cluster-tool', 'equipment'), P('equipment', 'loadlock', 'equipment'), P('equipment', 'wafer-robot', 'equipment'),
      P('equipment', 'process-chambers', 'equipment'), P('equipment', 'vacuum-gas', 'equipment'),
      P('protocols', 'rs-232', 'protocol'), P('protocols', 'devicenet', 'protocol'), P('protocols', 'tcp-socket', 'protocol'),
      P('protocols', 'modbus', 'protocol'), P('protocols', 'opc-da', 'protocol'), P('protocols', 'secs-gem', 'protocol'),
      P('tools', 'secs-decoder', 'tool'), P('tools', 'modbus-frame', 'tool'), P('tools', 'unit-converter', 'tool'),
      P('tools', 'pumpdown', 'tool'), P('tools', 'cheat-sheets', 'learn'),
      P('learn', 'wafer-journey', 'learn'), P('learn', 'path', 'learn'), P('learn', 'challenge', 'learn'),
      P('learn', 'ask', 'learn'), P('learn', 'glossary', 'glossary')
    ],
    email: 'dat.do@hytekvn.com.vn'
  };
})(typeof window !== 'undefined' ? window : globalThis);
