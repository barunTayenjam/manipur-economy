# Plan 012: Content Freshness + Fact-Check Automation

**Category:** Content
**Leverage:** MEDIUM
**Effort:** M
**Risk:** LOW
**Depends On:** —
**Base Commit:** `192477d`

## Problem
Editorial numbers (death toll 306, tourism 17,078, disruption 225 days, 18 timeline events, 10 map places) are frozen in `index.html` + `data/*.json`. No guard against stale as-of dates or placeholder leaks.

## Implementation
1. Create `scripts/check-content.mjs` (Node, no deps):
   - Parse `data/charts.json`: assert death series is non-decreasing, last label contains a year >= 2025; tourism 2024-25 value < 2019-20 (conflict drop); disruption series all > 0.
   - Parse `data/map.geo.json`: assert 10 places, 2 highways, every `c` lat 23–27 / lon 92–95.5, every place has non-empty name/role/note/stat.
   - Scan `index.html`: fail on placeholders (`lorem`, `TODO`, `FIXME`, `XXX`, `2026*` without footnote is OK only inside chart labels — allowlist `chart-disruption` labels); assert exactly 12 `<section id=` present (phases, baseline, losers, gainers, shadow, economy, blockade, timeline, ledger, officials, outlook, faq); assert `.faq-item` count 8–12.
   - Assert every `http` source link has a neighboring year or is in footnotes (cheap staleness proxy: grep `<li>` sources contain `20` date string); report links without dates as warnings, not failures.
2. Add `package.json` script `"check:content"`.
3. CI: run in `check` job. Weekly schedule (reuse `link-check.yml` workflow or new `content.yml`) that opens an issue if `check-content` warns 3 weeks running (staleness nudge).

## Files
| File | Action |
|------|--------|
| `scripts/check-content.mjs` | Create |
| `package.json` | Add `check:content` |

## Verification
```bash
npm run check:content  # exit 0
# Negative: set a death value lower than previous, re-run → exit 1; revert
```

## Done Criteria
- [ ] Content invariants enforced (monotonic deaths, geo bounds, 12 sections, FAQ range)
- [ ] CI runs it; green
- [ ] No false positives on `*` year markers in disruption labels

## Maintenance
- Update expected counts when editorial adds sections/places. Keep allowlist minimal.
