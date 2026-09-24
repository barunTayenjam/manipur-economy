# ADR 0001: ES Modules, No Bundler

## Status
Accepted

## Context
Single-page report: `index.html` + `assets/css/site.css` (~44KB) + 4 JS modules (`assets/js/utils.js`, `charts.js`, `map.js`, `main.js`). Entry `<script type="module" src="assets/js/main.js">` (`index.html`). Legacy `assets/js/site.js` deleted (404 on live, asserted in `tests/e2e/smoke.spec.mjs`).

## Decision
Ship native ES modules with `import`/`export`, no Vite/webpack/rollup. Zero build step.

## Alternatives
- Bundler (Vite): rejected — single page, 4 modules, HTTP/2 + Pages CDN make bundling marginal; adds config + lockfile churn.
- One monolith IIFE: rejected — untestable, global leaks (see removed `window.__manipurMap`).

## Consequences
Positive: `node --check` + ESLint + unit imports work directly; diffs reviewable; no build drift.
Negative: no minification/tree-shaking; rely on CDN minified artifacts (Chart.js UMD, Leaflet) + SRI.
