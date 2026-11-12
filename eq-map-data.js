/* HYTEK equipment ↔ software map: concept level, general textbook knowledge only.
   Signal kinds, protocol families and software layers are typical for this class of equipment in general;
   examples are invented and generic (no real IDs, signal names, vendors or tools).
   protocols = protocol page ids in site-map.js; page = equipment page id. English text below, Vietnamese in lang/vi-eqmap.js. */
(function (w) {
  const part = (id, page, signals, protocols, layer) => ({ id, page, signals, protocols, layer, key: 'eq.' + id + '.name', example: 'eq.' + id + '.ex' });
  w.HY_EQMAP = {
    parts: [
      part('load-port', 'cluster-tool', ['digital', 'network'], ['tcp-socket', 'secs-gem'], 'sequence'),
      part('loadlock', 'loadlock', ['digital', 'analog'], ['devicenet', 'modbus'], 'sequence'),
      part('wafer-robot', 'wafer-robot', ['serial', 'network'], ['rs-232', 'tcp-socket'], 'driver'),
      part('transfer-chamber', 'cluster-tool', ['digital', 'analog'], ['devicenet'], 'interlock'),
      part('process-chamber', 'process-chambers', ['digital', 'analog'], ['devicenet', 'modbus', 'opc-da'], 'sequence'),
      part('vacuum-pump', 'vacuum-gas', ['digital', 'serial'], ['rs-232', 'modbus'], 'driver'),
      part('gate-valve', 'vacuum-gas', ['digital'], ['devicenet'], 'interlock'),
      part('gas-mfc', 'vacuum-gas', ['analog', 'network'], ['devicenet', 'modbus'], 'driver'),
      part('rf-generator', 'process-chambers', ['analog', 'serial'], ['rs-232', 'devicenet'], 'driver'),
      part('pressure-gauge', 'vacuum-gas', ['analog', 'serial'], ['rs-232', 'modbus'], 'driver'),
      part('host-link', 'cluster-tool', ['network'], ['secs-gem', 'tcp-socket'], 'gem')
    ]
  };
  w.HY_EQMAP_EN = {
    'eq.load-port.name': 'Load port', 'eq.load-port.does': 'Where a wafer carrier docks. It checks the carrier is seated, opens it and tells the tool which slots hold wafers.', 'eq.load-port.ex': 'Carrier placed and clamped',
    'eq.loadlock.name': 'Loadlock', 'eq.loadlock.does': 'A small chamber that pumps down and vents so wafers can pass between air and vacuum without venting the whole tool.', 'eq.loadlock.ex': 'Loadlock reached transfer pressure',
    'eq.wafer-robot.name': 'Wafer transfer robot', 'eq.wafer-robot.does': 'Moves wafers between loadlocks and process chambers inside the vacuum, one station at a time.', 'eq.wafer-robot.ex': 'Wafer picked from loadlock A',
    'eq.transfer-chamber.name': 'Transfer chamber', 'eq.transfer-chamber.does': 'The vacuum hub in the middle of a cluster tool. Slit valves on each side open only when it is safe.', 'eq.transfer-chamber.ex': 'Slit valve closed before rotate',
    'eq.process-chamber.name': 'Process chamber', 'eq.process-chamber.does': 'Where the work on the wafer happens: deposition or etch, run step by step from a recipe.', 'eq.process-chamber.ex': 'Recipe step 3 complete',
    'eq.vacuum-pump.name': 'Vacuum pumps', 'eq.vacuum-pump.does': 'A rough pump and a high-vacuum pump take the chamber from atmosphere down to working pressure.', 'eq.vacuum-pump.ex': 'High-vacuum pump at speed',
    'eq.gate-valve.name': 'Gate and slit valves', 'eq.gate-valve.does': 'Open and close the path between chambers or to the pump. Interlocks decide when they are allowed to move.', 'eq.gate-valve.ex': 'Valve open timeout',
    'eq.gas-mfc.name': 'Gas box and mass flow controllers', 'eq.gas-mfc.does': 'Meter process gases into the chamber at a set flow and report the actual flow back.', 'eq.gas-mfc.ex': 'Gas flow out of tolerance',
    'eq.rf-generator.name': 'RF / DC power supply', 'eq.rf-generator.does': 'Delivers the power that strikes and holds the plasma, and reports forward and reflected power.', 'eq.rf-generator.ex': 'Reflected power high',
    'eq.pressure-gauge.name': 'Pressure gauges', 'eq.pressure-gauge.does': 'Measure chamber pressure across many decades, from atmosphere to high vacuum.', 'eq.pressure-gauge.ex': 'Base pressure reached',
    'eq.host-link.name': 'Factory host link', 'eq.host-link.does': 'Connects the tool to the factory host: status, events, alarms, recipes and remote commands.', 'eq.host-link.ex': 'Event report sent to host',
    'eq.sig.digital': 'Digital I/O', 'eq.sig.analog': 'Analog I/O', 'eq.sig.serial': 'Serial', 'eq.sig.network': 'Network',
    'eq.layer.driver': 'Device driver', 'eq.layer.sequence': 'Sequence control', 'eq.layer.interlock': 'Interlocks and safety', 'eq.layer.gem': 'GEM / host integration',
    'eq.lbl.signals': 'Signals', 'eq.lbl.protocols': 'Typical protocols', 'eq.lbl.layer': 'Software layer', 'eq.lbl.example': 'Example event',
    'eq.lbl.parts': 'Parts', 'eq.lbl.map': 'Equipment map', 'eq.lbl.pause': 'Pause animation', 'eq.lbl.play': 'Play animation', 'eq.lbl.pick': 'Pick a part', 'eq.lbl.wait': 'Loading 3D model…', 'eq.all': 'All', 'eq.all.name': 'Whole cluster tool', 'eq.all.does': 'Every part in view at once. Pick a part to see what it does, how it talks and which software layer drives it.', 'eq.lbl.more': 'Read more',
    'eq.note': 'Concept-level view of a typical cluster tool. Examples are invented.'
  };
})(typeof window !== 'undefined' ? window : globalThis);
