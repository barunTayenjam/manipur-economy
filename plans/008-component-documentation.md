# Plan 008: Component Documentation (Design System Catalog)

**Category:** DX/Docs
**Leverage:** MEDIUM
**Effort:** M
**Risk:** LOW
**Depends On:** 006 (TypeScript types give prop docs)
**Base Commit:** `192477d`

## Problem
Design tokens and components (`.badge`, `.phase`, `.ex-card`, `.flow`, `.ledger`, `.chart`, `.faq-item`, `.meth-note`) exist only in `assets/css/site.css` (~44KB) and `index.html`. No catalog, so visual drift is likely.

## Current State
- Tokens in `assets/css/site.css`: `--bg:#FAFAF8`, `--ink:#1E232A`, `--crimson:#A31621`, `--green:#1A5C30`, `--amber:#7A4F00`, `--rule`, fonts Spectral/Archivo/Spline Sans Mono
- No Storybook, no catalog. `DESIGN.md` exists but is prose, not live examples.

## Decision (senior-lead)
Do NOT add Storybook — too heavy for a zero-build static single-page. Build a lightweight `docs/components.html` catalog that reuses `assets/css/site.css` directly. Zero deps, always in sync by construction.

## Implementation
1. Create `docs/components.html`:
   - `<link rel="stylesheet" href="../assets/css/site.css">`
   - Sections, one per component: badge (c/g/a/n variants), phase p1/p2/p3, ex-card, flow-n, ledger table (3 rows sample), chart frame (empty `.chart-frame` + `.chart-cap`), faq-item open/closed, meth-note, outlook-card
   - Token table at top: swatches rendered with `style="background:var(--crimson)"` etc., plus mono names
2. Add npm script: `"docs:components": "python3 -m http.server 4173 --bind 127.0.0.1"` reuse; no build needed. Just open `docs/components.html`.
3. Add unit test in `tests/unit.test.mjs` (STRUCTURAL section):
   - `readFileSync('docs/components.html')` includes each of: `badge c`, `phase-label p1`, `ex-card`, `flow-n`, `class="ledger"`, `chart-frame`, `faq-item`, `meth-note`, `--crimson`
4. Add CI check: extend Prettier to `docs/**/*.html` in `package.json` format scripts + `eslint.config.js` unchanged (no JS).

## Files
| File | Action |
|------|--------|
| `docs/components.html` | Create |
| `tests/unit.test.mjs` | Add catalog coverage test |
| `package.json` | Add `docs/**/*` to prettier globs |

## Verification
```bash
npx prettier --check "docs/**/*.html"
node tests/unit.test.mjs 2>&1 | tail -3  # 91+1 passed
python3 -m http.server 4173 --bind 127.0.0.1 & # open /docs/components.html, visually confirm 8 sections render
```

## Done Criteria
- [ ] `docs/components.html` renders all 8+ components using production CSS
- [ ] Unit test asserts catalog covers tokens + components
- [ ] Prettier covers docs HTML, `npm run check` green
- [ ] No new runtime deps

## Escape Hatches
- If catalog drifts: the unit test fails when a class is renamed — update both together.
- If Storybook later wanted: this catalog becomes the spec; migrate then, not now.

## Maintenance
- Update catalog when adding a component variant. Review in PR screenshots.
