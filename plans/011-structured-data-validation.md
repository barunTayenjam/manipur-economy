# Plan 011: Structured Data Validation in CI

**Category:** SEO/Quality
**Leverage:** MEDIUM
**Effort:** S
**Risk:** LOW
**Depends On:** —
**Base Commit:** `192477d`

## Problem
`index.html` ships JSON-LD `Article` + `FAQPage` + `Dataset`, OG tags, `sitemap.xml`, `robots.txt`, `site.webmanifest` — but only string-presence unit tests. Malformed JSON-LD or OG drift would ship silently.

## Current State
- Unit tests assert `"@type": "Article"` etc. via `includes()` — no parse, no schema validation.
- `sitemap.xml`, `robots.txt` exist but unchecked in CI.

## Implementation
1. Create `scripts/check-seo.mjs` (Node, no deps):
   - Extract `<script type="application/ld+json">` blocks from `index.html`, `JSON.parse` each; assert each has `@context:https://schema.org` and allowed `@type` in {Article, FAQPage, Dataset}; for FAQPage assert `mainEntity.length` equals `.faq-item` count in HTML; for Dataset assert `distribution` or `spatialCoverage` mentions Manipur.
   - Assert OG: `og:title`, `og:description`, `og:image`, `og:url` (canonical `https://baruntayenjam.github.io/manipur-economy/`), `og:type=article`.
   - Assert `sitemap.xml` parses as XML, contains the canonical URL; `robots.txt` contains `Sitemap:` line; `site.webmanifest` parses as JSON with `name` + `icons`.
   - Exit non-zero with clear message on first failure.
2. Add `package.json` script: `"check:seo": "node scripts/check-seo.mjs"`.
3. Add CI step in `check` job after unit tests: `- name: Structured data check / run: npm run check:seo`.

## Files
| File | Action |
|------|--------|
| `scripts/check-seo.mjs` | Create |
| `package.json` | Add `check:seo` |
| `.github/workflows/ci.yml` | Add step |

## Verification
```bash
npm run check:seo  # exit 0
# Negative: temporarily break one @type, re-run → exit 1 with message; revert
```

## Done Criteria
- [ ] Script validates JSON-LD parse + types + FAQ count match + OG + sitemap/robots/manifest
- [ ] CI `check` job runs it and passes
- [ ] `npm run check` extended (or CI) covers it; no regressions

## Escape Hatches
- If FAQ count intentionally differs from FAQPage entities: assert `>=` with comment, not `===`.
- If sitemap gains URLs: assert canonical ⊆ sitemap URLs rather than equality.

## Maintenance
- Update assertions when adding schema types or pages.
