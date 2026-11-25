# Plan 015 — SEO / GEO / AEO continuation

**Base commit:** `1006a25` (feat(seo): humanise copy and improve SEO, GEO and AEO)
**Created:** 2026-11-25 · **Status:** ✅ Done

Follow-up to the first SEO pass. Audit findings from this session:

- Lighthouse (local, 3 runs): performance 0.99 · accessibility 1.0 · best-practices 1.0 · **SEO 1.0** — no shallow SEO defects left.
- `npm run check:seo` green; structured data already carries Article, FAQPage, Dataset, Person, WebSite, WebPage, Event + `speakable`.
- Remaining gaps are on the surfaces Lighthouse cannot see: the GitHub README (a top AI-crawl surface, with **stale facts**), robots.txt crawler coverage, FAQ answer shape, entity disambiguation, a custom 404, and guardrails so none of it rots.

## Checklist

- [x] **Tests** — `tests/e2e/smoke.spec.mjs:102` still asserted the retired `345` death figure (page is `346`); fixed, e2e green.
- [x] **GEO · README** — corrected stale facts that contradicted the live page: 9→**10** map locations, 38→**72** chronology events (May 2023 → **November 2026**), 12→**11** FAQ questions, 11→**12** ledger rows, badge "verified 21 Oct 2026"→**25 Nov 2026**, `assets/js/site.js`→`main.js` (plus project-structure block).
- [x] **GEO · README** — added an "SEO, GEO & AEO" section pointing at `llms.txt`, `robots.txt`, `sitemap.xml`, `npm run check:seo`, with deep links to the report's key sections.
- [x] **GEO · robots.txt** — added the answer-engine crawlers that were missing: `Amazonbot`, `meta-externalagent`, `cohere-ai`, `YouBot`, `Diffbot`, `Applebot`, `Bingbot`, grouped by purpose.
- [x] **GEO · JSON-LD** — author `Person` now carries `sameAs` (GitHub profile) so engines resolve the byline to one entity.
- [x] **AEO · FAQ #1** — the "right now" answer led with nothing; it now opens with a one-sentence direct answer (blockade suspended not escalating front → 346 dead → CoTU ultimatum) in **both** the visible FAQ and the `FAQPage` JSON-LD, with the citation moved next to the claim it supports. Added `.faq-a p + p` spacing and bumped `site.css?v=2026-11-25c`.
- [x] **SEO · `<title>`** — appended the coverage range (`2023–2026`); 56 chars, keyword-bearing.
- [x] **SEO · `404.html`** — custom not-found page (GitHub Pages serves it with a real 404 status) with `noindex`, an absolute `<base>` so relative links survive nested paths, and links back to the report sections.
- [x] **Guardrails · `scripts/check-seo.mjs`** — 11 new assertions: canonical `<link>`, `twitter:card`, `SpeakableSpecification`, `llms.txt` alternate link, title length/keyword, single `<h1>`, no skipped heading levels, `article:modified_time` = JSON-LD `dateModified` = sitemap `lastmod`, Dataset `distribution` downloads, author `sameAs`, `404.html` (noindex + base + section links), and the expanded robots crawler set.
- [x] **Verify** — `lint`, `typecheck`, `format:check`, 99 unit tests, `check:seo`, `check:content`, 7 e2e + 1 axe a11y all green; Lighthouse re-run (local, 3 runs): performance 0.99 · accessibility 1.0 · best-practices 1.0 · SEO 1.0. `.lighthouseci/` added to `.gitignore`.

## Not in scope (needs the owner)

- Google Search Console verification + submitting `sitemap.xml` — requires the owner's Google account.
- Analytics/search-performance loop — deliberately off by default (plan 014, privacy ADR).
