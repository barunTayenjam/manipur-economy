# Improvement Plans for 10/10 "Source of Truth" Quality

**Base commit:** `192477d`  
**Created:** 2026-09-24  
**Status:** 📋 Planned

## Priority Order & Dependencies

| # | Plan | Category | Leverage | Depends On | Status |
|---|------|----------|----------|------------|--------|
| 001 | Lighthouse CI + Performance Budgets | Performance | HIGH | — | 📋 |
| 002 | Visual Regression Tests (Playwright) | Testing | HIGH | 001 | 📋 |
| 003 | Dependabot + Security Scanning in CI | Security/DX | HIGH | — | 📋 |
| 004 | Broken Link Checker (Scheduled) | Operations | MEDIUM | — | 📋 |
| 005 | Uptime Monitoring + Alerting | Operations | MEDIUM | — | 📋 |
| 006 | TypeScript Migration (Strict Mode) | Code Quality | HIGH | — | 📋 |
| 007 | CSP via Meta Tags + Security Headers | Security | MEDIUM | — | 📋 |
| 008 | Component Documentation (Storybook) | DX/Docs | MEDIUM | 006 | 📋 |
| 009 | ADRs for Key Architectural Decisions | Architecture/Docs | MEDIUM | — | 📋 |
| 010 | Contributing Guide + Issue Templates | DX/Docs | LOW | — | 📋 |
| 011 | Structured Data Validation in CI | SEO/Quality | MEDIUM | — | 📋 |
| 012 | Content Freshness + Fact-Check Automation | Content | MEDIUM | — | 📋 |
| 013 | Rollback/Incident Runbook | Operations | LOW | — | 📋 |
| 014 | Privacy-Friendly Analytics (Optional) | Analytics | LOW | — | 📋 |

## Dependency Graph

```
001 (Perf budgets) ──► 002 (Visual regression)
006 (TypeScript) ────► 008 (Storybook)
All others: independent
```

## Execution Strategy

1. **Phase 1 (Week 1):** 001, 003, 004, 005, 007, 011 — CI/infrastructure hardening
2. **Phase 2 (Week 2):** 006, 002 — TypeScript + visual regression (depends on 001)
3. **Phase 3 (Week 3):** 008, 009, 010, 012, 013, 014 — Documentation & polish

## Verification Gates

Each plan must pass:
- `npm run check` (lint + format + unit + e2e + a11y)
- Plan-specific verification commands
- No regression in existing tests

---

**Next Action:** Execute Plan 001 (Lighthouse CI) first — it unblocks visual regression and establishes performance baseline.