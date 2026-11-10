/* HYTEK site registry: menu sections and every page of the hub. Paths are relative to the site root.
   `en` is the English page name (VI names live in lang/vi-hub.js under the same key). */
(function (w) {
  const P = (section, id, kind, en) => ({ id, section, kind, en, path: section + '/' + id + '/index.html', key: 'hub.pg.' + id });
  w.HY_SITE = {
    sections: [
      { id: 'equipment', path: 'equipment/index.html', key: 'hub.nav.equipment' },
      { id: 'protocols', path: 'protocols/index.html', key: 'hub.nav.protocols' },
      { id: 'tools', path: 'tools/index.html', key: 'hub.nav.tools' },
      { id: 'learn', path: 'learn/index.html', key: 'hub.nav.learn' },
      { id: 'about', path: 'index.html', key: 'hub.nav.about' }
    ],
    pages: [
      P('equipment', 'cluster-tool', 'equipment', 'Cluster tool'), P('equipment', 'loadlock', 'equipment', 'Loadlock'),
      P('equipment', 'wafer-robot', 'equipment', 'Wafer transfer robot'),
      P('equipment', 'process-chambers', 'equipment', 'Process chambers: IBE, IBD, PVD, RIE'),
      P('equipment', 'vacuum-gas', 'equipment', 'Pumps, valves and gas flow'),
      P('protocols', 'rs-232', 'protocol', 'RS-232 / COM serial'), P('protocols', 'devicenet', 'protocol', 'DeviceNet'),
      P('protocols', 'tcp-socket', 'protocol', 'TCP/IP socket (ASCII / raw)'), P('protocols', 'modbus', 'protocol', 'Modbus TCP · RTU · ASCII'),
      P('protocols', 'opc-da', 'protocol', 'OPC DA'), P('protocols', 'secs-gem', 'protocol', 'SECS/GEM · HSMS'),
      P('tools', 'secs-decoder', 'tool', 'SECS-II / HSMS decoder'), P('tools', 'modbus-frame', 'tool', 'Modbus frame builder'),
      P('tools', 'unit-converter', 'tool', 'Vacuum & flow unit converter'), P('tools', 'pumpdown', 'tool', 'Pump-down time estimate'),
      P('tools', 'cheat-sheets', 'learn', 'Cheat sheets'),
      P('learn', 'wafer-journey', 'learn', 'Wafer journey in 3D'), P('learn', 'path', 'learn', 'Learning path'),
      P('learn', 'challenge', 'learn', 'Challenges'), P('learn', 'ask', 'learn', 'Ask an engineer'),
      P('learn', 'glossary', 'glossary', 'Glossary A–Z')
    ],
    email: 'dat.do@hytekvn.com.vn'
  };
})(typeof window !== 'undefined' ? window : globalThis);
