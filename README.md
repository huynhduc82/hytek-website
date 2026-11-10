# HYTEK SOLUTIONS VN — website

Static, bilingual (EN/VI) website for HYTEK SOLUTIONS VN COMPANY LIMITED — semiconductor equipment software engineering.
A knowledge hub (equipment, protocols, tools, learning) plus the company page under `about/`.

- `index.html` — home: clickable 3D equipment map, entry points, featured tools
- `about/` — company page (scroll-driven 3D chamber, equipment platforms, GEM/SECS, simulator, partnership)
- `equipment/`, `protocols/`, `tools/`, `learn/` — one folder per page, each with its own `index.html`
- `site-map.js` — page registry (menu and page list); `site.js` — shared header, menu and footer
- `i18n.js` + `lang/*.js` — English / Vietnamese switch (`?lang=vi`)
- `eq-kit.js`, `eq-map-data.js`, `eq-map.js` — equipment parts and the equipment ↔ software map
- `tools/secs-decoder/` — SECS-II / HSMS decoder; `protocols/secs-gem/hsms.js` — HSMS state machine
- `styles.css`, `hub.css` — styles

All visuals are simulations. Open `index.html` in a browser to preview (works from `file://`); no build step.
Tests: `node --test tests/*.test.js` (Node 20+, no dependencies).
