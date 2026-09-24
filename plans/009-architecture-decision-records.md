# Plan 009: ADRs for Key Architectural Decisions

**Category:** Architecture/Docs
**Leverage:** MEDIUM
**Effort:** S
**Risk:** LOW
**Depends On:** —
**Base Commit:** `192477d`

## Problem
Decisions (ES modules + no bundler, Chart.js CDN+SRI, Leaflet+OSM, data JSON extraction, zero-build, GitHub Pages) live only in git history. Future editors will re-litigate them.

## Implementation
1. Create `docs/adr/` with:
   - `0001-es-modules-no-bundler.md` — why `type=module` + 4 modules, no Vite/webpack; consequences: no minification, relies on HTTP/2 + Pages CDN
   - `0002-chartjs-cdn-sri-lazy.md` — why Chart.js 4.4.1 via jsdelivr + SRI `sha384-9nhcz...`, lazy on IO with `rootMargin 300px`
   - `0003-leaflet-osm-tiles.md` — why Leaflet 1.9.4 unpkg + OSM tiles (no key wall, cf. commit `c4c55da` CARTO keywall removal)
   - `0004-data-json-extraction.md` — why `data/charts.json` (3 figures) + `data/map.geo.json` (view+10 places+2 highways) fetched with `force-cache`
   - `0005-zero-build-github-pages.md` — why no build step; CI `check+e2e` gates `deploy-pages`
   - `README.md` — index with status table (all Accepted)
2. Format per architect skill ADR template: Context, Decision, Alternatives, Consequences. One page each, evidence with `file:line` (e.g. `assets/js/charts.js`, `playwright.config.mjs`, `.github/workflows/ci.yml`).
3. Add unit test: assert each ADR file exists + contains `## Decision` + `## Consequences`.

## Files
| File | Action |
|------|--------|
| `docs/adr/0001-*.md` … `0005-*.md`, `docs/adr/README.md` | Create |
| `tests/unit.test.mjs` | Add ADR presence test |

## Verification
```bash
ls docs/adr/*.md  # 6 files
node tests/unit.test.mjs 2>&1 | tail -3
```

## Done Criteria
- [ ] 5 ADRs + index, each with Context/Decision/Alternatives/Consequences
- [ ] Unit test guards against deletion
- [ ] `npm run check` green

## Maintenance
- New ADR per significant decision (numbered monotonically). Never edit Accepted ADRs — supersede.
