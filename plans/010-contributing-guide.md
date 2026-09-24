# Plan 010: Contributing Guide + Issue Templates

**Category:** DX/Docs
**Leverage:** LOW
**Effort:** S
**Risk:** LOW
**Depends On:** —
**Base Commit:** `192477d`

## Problem
No documented dev loop, commit rules, or PR bar. `README.md` covers product, not contribution.

## Implementation
1. Create `CONTRIBUTING.md`:
   - Prereqs: Node >=20, Python 3 (http.server for Playwright webServer), Chromium via `npx playwright install --with-deps chromium`
   - Loop: `npm ci` → `npm run check` (lint+format+unit+e2e+a11y) → edit → re-run. GPG fails → `git commit --no-verify`.
   - Rules: no inline `style=` on `.sec-takeaway` (token-driven), data edits go in `data/*.json` not JS, SRI must be updated with CDN version bumps, baselines updated intentionally via `--update-snapshots`.
   - PR bar: `npm run check` green + CI `check`/`e2e` green before merge.
2. Create `.github/ISSUE_TEMPLATE/bug_report.md` (repro, URL, viewport, console log) and `content_update.md` (claim, proposed text, source URL, source date).
3. Create `.github/PULL_REQUEST_TEMPLATE.md`: checklist (check green, data sources cited, a11y no new violations, screenshots for visual changes).

## Files
| File | Action |
|------|--------|
| `CONTRIBUTING.md` | Create |
| `.github/ISSUE_TEMPLATE/bug_report.md`, `content_update.md` | Create |
| `.github/PULL_REQUEST_TEMPLATE.md` | Create |

## Verification
```bash
ls CONTRIBUTING.md .github/ISSUE_TEMPLATE/ .github/PULL_REQUEST_TEMPLATE.md
npm run check  # unaffected, still green
```

## Done Criteria
- [ ] Contributing loop documented and accurate (follow it once verbatim)
- [ ] Issue + PR templates present
- [ ] No test regressions

## Maintenance
- Update when scripts change (`package.json` scripts are source of truth).
