# ADR 0002: Chart.js via CDN with SRI, Lazy on IntersectionObserver

## Status
Accepted

## Context
3 figures (death line, tourism bar, disruption bar) in `.chart-frame` canvases (`index.html` ids `chart-death`, `chart-tourism`, `chart-disruption`). Chart.js is ~200KB — must not block first paint.

## Decision
Load Chart.js 4.4.1 UMD from jsdelivr at runtime via `loadScript()` (`assets/js/utils.js`) with SRI `sha384-9nhcz...` (`assets/js/charts.js:CHART_JS_SRI`), triggered per-frame by `onVisible(frame, boot, { rootMargin: '300px' })`. Theme from CSS tokens via `cssVar()` + `axis()` factory + `buildConfigs()` (pure, unit-tested). Failure adds `.chart-failed` with data note (`markFrameFailed`).

## Alternatives
- Self-host Chart.js: rejected — CDN + SRI gives caching + integrity without vendoring 200KB.
- Inline SVG charts: rejected — replaced in `e1a4c35` for maintainability + lazy rendering.

## Consequences
Positive: first paint unblocked; SRI pins bytes; pure `buildConfigs` testable in Node.
Negative: CDN dependency at view-time; CSP must allow `cdn.jsdelivr.net` (see CSP meta in `index.html`).
