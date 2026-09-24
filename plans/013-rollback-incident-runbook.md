# Plan 013: Rollback / Incident Runbook

**Category:** Operations
**Leverage:** LOW
**Effort:** S
**Risk:** LOW
**Depends On:** —
**Base Commit:** `192477d`

## Problem
Rollback is "git revert + push" but undocumented. No incident owner, no triage order, no Pages-specific notes (Pages builds from branch, deploy job needs `check+e2e` green).

## Implementation
1. Create `docs/RUNBOOK.md`:
   - **Rollback (fast):** `git revert <sha> && git push origin main` (use `--no-verify` if GPG fails); Pages redeploys automatically; verify `https://baruntayenjam.github.io/manipur-economy/` HTTP 200 + `data/charts.json` 200.
   - **Rollback (blocked CI):** if `check`/`e2e` red, fix forward on a branch, PR, merge only when green — `deploy` job has `needs:[check,e2e]`.
   - **Triage order:** 1) CI run URL 2) Pages deployment status 3) `npm run check` locally 4) Playwright trace/`test-results` 5) curl live asset checklist (main.js, site.css, charts.json, map.geo.json).
   - **Contacts/ownership:** repo owner = incident owner; link CI, Pages settings, Uptime monitor (plan 005).
   - **Post-incident:** 5-line template (what, impact, root cause, fix, prevention).
2. Add unit test: `docs/RUNBOOK.md` exists + contains `git revert` + canonical URL.

## Files
| File | Action |
|------|--------|
| `docs/RUNBOOK.md` | Create |
| `tests/unit.test.mjs` | Add presence test |

## Verification
```bash
grep -q "git revert" docs/RUNBOOK.md && grep -q "manipur-economy" docs/RUNBOOK.md
node tests/unit.test.mjs 2>&1 | tail -2
```

## Done Criteria
- [ ] Runbook covers rollback, triage, ownership, post-incident
- [ ] Presence test green, `npm run check` green

## Maintenance
- Update on workflow/monitor changes.
