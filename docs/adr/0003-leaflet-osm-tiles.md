# ADR 0003: Leaflet + OSM Tiles (No Key Wall)

## Status
Accepted

## Context
Interactive map `#map` with 10 places + NH-2/NH-37 highways. Earlier CARTO basemap hit API-key walls for some visitors (commit `c4c55da`).

## Decision
Leaflet 1.9.4 via unpkg with SRI `sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=` (`assets/js/map.js`), OSM tiles `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, lazy via `onVisible(mapEl, ..., { rootMargin: '200px' })`. Geometry in `data/map.geo.json`; highway colors from CSS tokens (`--crimson`, `--ink`). Failure renders `.map-fallback` with table pointer.

## Alternatives
- CARTO basemaps: rejected — keywall risk.
- Static SVG map: rejected — loses zoom/popup storytelling.

## Consequences
Positive: no keys, no quota; scroll-gated (`scrollWheelZoom: false` until click).
Negative: tile availability depends on OSM; CSP must allow `tile.openstreetmap.org`; e2e uses `domcontentloaded` (tiles block `networkidle`).
