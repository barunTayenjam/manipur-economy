# ADR 0004: Editorial Data Extracted to JSON

## Status
Accepted

## Context
Chart series and map geometry were hardcoded in JS. Editors needed data-only diffs; tests needed stable fixtures.

## Decision
`data/charts.json` (3 figures: ids, labels, series, colors as logical keys, yMax, tooltip) + `data/map.geo.json` (view center/zoom, 10 places with c/cat/name/role/note/stat, 2 highways with code/token/points). Fetched with `{ cache: 'force-cache' }`. Colors never hardcode hex — resolved via `resolveColor()` + `cssVar()` (`assets/js/charts.js`). Validated by `scripts/check-content.mjs` + unit DATA FILES section.

## Alternatives
- Hardcode in JS: rejected — mixes editorial + logic, noisy diffs.
- CMS/API: rejected — static site, no backend; JSON in repo is the source of truth with git history.

## Consequences
Positive: content PRs touch only JSON/HTML; `check-content` enforces monotonic deaths, geo bounds, counts.
Negative: two extra fetches at view-time (cached); must keep HTML frame ids in sync (unit test asserts).
