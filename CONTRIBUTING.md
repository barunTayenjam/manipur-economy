# Contributing

## Prereqs
- Node >= 20, Python 3 (Playwright `webServer` uses `python3 -m http.server 4173`)
- Chromium: `npx playwright install --with-deps chromium`

## Dev loop
```bash
npm ci
npm run check   # lint + format + unit + e2e + a11y + seo + content
# edit, then re-run npm run check
```
GPG signing fails in this repo — always `git commit --no-verify`.

## Rules
- Token-driven CSS only: no `style=` on `.sec-takeaway` (unit-tested).
- Editorial numbers go in `data/charts.json` / `data/map.geo.json`, never hardcoded in JS (unit + `check:content` enforce).
- CDN bumps require SRI updates in `assets/js/charts.js` (`CHART_JS_SRI`) / `assets/js/map.js` (`LEAFLET_SRI`) + CSP domains in `index.html` if hosts change.
- Reveal failsafe inline script in `<head>` is load-bearing: keep `js-ready` gate; if edited, CSP notes in plan 007 apply.
- Visual changes: update `docs/components.html` catalog in the same PR.
- Baselines: `tests/visual/*` snapshots updated intentionally via `--update-snapshots`, committed with the PR.

## PR bar
- `npm run check` green locally.
- CI `check` / `security` / `e2e` / `lighthouse` green before merge.
- Content PRs cite sources (see `content_update.md` template).
