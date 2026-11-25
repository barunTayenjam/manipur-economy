# Plan 016 — Modern Website Best-Practices Audit Fixes

## Header

- **Plan:** 016-modern-website-audit-fixes
- **Created against git commit:** `ce0076b`
- **Status:** drafted (audit findings pending fix execution)
- **Priority:** High
- **Effort:** M (multiple small, mostly mechanical edits to HTML/CSS; no new dependencies)

## Problem Statement

Run of the Awwwards-style jury audit (`/jury` skill workflow: `shoot.mjs --crawl --nav`, `audit.mjs`, fresh critic from evidence) plus project-native best-practices checks against the live site:

- `npm run check:seo` + `check:content` + `check:links`
- `npm audit --audit-level=low` (dependency security)
- Playwright e2e + a11y (`npm run test:all`)
- Lighthouse CI autorun (`npm run lhci`)
- Manual best-practices review: PWA manifest, SRI, 100vh bug, touch highlight, print styles, CSP, color-scheme, overscroll, image lazy-loading, alt text, font-display, viewport, scroll-behavior, landmarks, semantic HTML, and more.

**Audit result:** Critic overall **6.7** → Jury estimate **~7.8** → Band: **Site of the Day range (7.2+)** on the high end; Usability **6**, Responsive **6**, Animations/Transitions **6**.

**Top-ranked fixable findings:**

| # | Finding | Area | Severity | Effort | Current Score | Target |
|---|---|---|---|---|---|---|
| 1 | Mobile tap targets below 24×24 px (8 instances) | Responsive/Usability | High | S | Responsive: 6 | 7 |
| 2 | 2 interactive links with no hover state / no visible response | Animations/Transitions | High | S | Anim: 6 | 7 |
| 3 | 1 primary link with color-only hover (`colorOnly`) | Animations/Transitions | Medium | S | Anim: 6 | 7 |
| 4 | 2 duplicate sentences in visible copy | Content | Medium | S | Content: 7 | 8 |
| 5 | Meta description 258 chars (aim 50–160) | Semantics/SEO | Low | S | Sem/SEO: 7 | 7 |
| 6 | 19 visible em/en dashes flagged as AI tell | Content | Low | S | Content: 7 | 8 |
| 7 | 404 page has no h1 (design it: a way back) | Accessibility | Medium | S | A11y: 7 | 8 |
| 8 | No skip link on 404 page | Accessibility | Medium | S | A11y: 7 | 8 |
| 9 | Mobile LCP 1936 ms borderline; intros after 3 s vs 2.6 s criterion | WPO | Medium | S | WPO: 7 | 7 |
| 10 | Mobile CLS 0.003 (pass); zero image lazy-loading; images have no `loading="lazy"` | WPO | Low | S | WPO: 7 | 8 |

### Additional modern best-practices findings (from evidence audit below):

| # | Finding | Area | Current | Target |
|---|---|---|---|---|
| 11 | No PWA `service worker` — site is pure static ✅ (acceptable for content site) | PWA | N/A | N/A |
| 12 | Manifest present, icons OK, `display: standalone` ✅ | PWA | Pass | Pass |
| 13 | No `crossorigin` / SRI on Leaflet script tag (CDN, risky on tile swaps) | Security | None | Add SRI |
| 14 | `meta viewport` has `viewport-fit=cover` — known mobile overflow bug on iOS; needs `safe-area` inset or remove | Mobile | Potential | Consider removing or testing |
| 15 | No `touch-action: manipulation` on body — may cause scroll inertia issues on touch | Mobile | Minor | Add `touch-action: manipulation` |
| 16 | No `:focus-visible` beyond 3 places; need focus-visible on all primary interactive controls | Accessibility | Partial | Expand focus-visible |
| 17 | Print styles present but only basic; no `page-break-inside: avoid` on chapter sections, no printer-friendly hide of nav/social | Print | Minor | Enhance print CSS |
| 18 | `prefers-color-scheme` not used — no dark mode; CSP `'unsafe-inline'` on styles prevents dark-mode toggle via CSS variables only | Dark mode | Not applicable | Document as known; not a fault |
| 19 | No `overscroll-behavior: contain` on html/body — may cause pull-to-effect flicker on mobile | Mobile | Minor | Add `overscroll-behavior: contain` |
| 20 | Leaflet geolocate has no `locateOptions` for `maxZoom` or `setView` on failure; map fallback covers text-only list ✅ | Accessibility | N/A | N/A |
| 21 | Google Tag Manager / analytics placeholder absent ✅ (privacy) | Privacy | N/A | N/A |
| 22 | `data-charts.json` + `data/map.geo.json` fetched with `cache: 'force-cache'` — stale forever risk; version stamps on URLs already in place ✅ | Cache | N/A | N/A |

## Recon Facts (context for executor)

- Site is **zero-build static**: `index.html` + `assets/css/site.css` + `assets/js/*.js` ES modules + `data/`, deployed GitHub Pages at `https://baruntayenjam.github.io/manipur-economy/`.
- **Commit:** `ce0076b` (self-heal CI deploy). Branch state: single page report + `404.html`.
- **Package manager:** npm. Scripts (relevant):
  - `npm run lint` — eslint on assets/js tests scripts eslint.config.js playwright.config.mjs
  - `npm run typecheck` — `tsc --noEmit`
  - `npm run format:check` / `format` — prettier
  - `npm test` — `node tests/unit.test.mjs` (baseline: **99 passed**)
  - `npm run check:seo` — `node scripts/check-seo.mjs`
  - `npm run check:links` — `node scripts/check-links.mjs`
  - `npm run check:content` — `node scripts/check-content.mjs`
  - `npm run test:all` — e2e + a11y Playwright
  - `npm run lhci` — Lighthouse CI autorun
- **Design tokens:** Paper `#FAFAF8`, Ink `#1E232A`, Crimson `#A31621` (loss/links), Green `#1A5C30` (gain), Amber `#7A4F00` (warning), Spectral display/body, Archivo condensed labels + tabular numerals, Spline Sans Mono for figures. No shadows, no border-radius, flat, hairline rules, booktabs tables.
- **Motion convention:** document behavior — instant state changes, gentle opacity/transform reveals, no layout-property animation; `prefers-reduced-motion` honored; JS-gated `.r` / `.dN` reveal classes.
- **Caching:** CSS URL bump `?v=2026-11-25d` on `assets/css/site.min.css`; data fetched `cache: 'force-cache'` with version-stamped URL.
- **CSP (meta):** default-src 'self'; script-src 'self' jsdelivr/unpkg 'unsafe-inline'; style-src 'self' https: 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' jsdelivr/unpkg/tile.openstreetmap.org; frame/object/base blocked; upgrade-insecure-requests.
- **Tests to keep green:** `npm test`, `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run check:*`, Playwright smoke/a11y.

## Current-State Evidence (from full audit, 2026-11-25)

### From jury audit (`shoot.mjs --crawl --max 8 --out .shots`)

1. **Mobile tap targets (8):** From `report.json` `mobile.smallTargets`:
   - `5 7x14`, `1 7x14`, `2 7x14`, `3 7x14`, `4 7x14`, `5 7x14` — footnotenum links (7×14 px)
   - `Northeast Now, Sep 17 161x20` — source link text (161×20 px)
   - Mobile-only subset: `The Hindu 8x164` (mobile source link).
   - **Fix:** ensure ≥24×24 px hit area for interactive controls on mobile.

2. **No-hover-change (2):** From `report.json` `hover.noHoverChange`:
   - `h-01 a "Zoom in"` — no style change on hover (dead link / map control).
   - `h-04 a "01 Conflict phases"` — no style change on hover (TOC anchor link).

3. **Color-only hover (1):** `h-02 a "Zoom out"` — react: color only (changed: color, borderColor, textDecorationColor). For a primary control, a full treatment preferred.

### From SEO/content audit (`npm run check:seo`, `npm run check:content`)

4. **Duplicate sentences:** "Foreign arrivals fell from 12,102 to 1,325." appears twice (lines 1459 and 3181 in `index.html`). Also "Scroll sideways to read the full table" duplicated at lines 172 and 3181 (one possibly `aria-hidden` decorative).

5. **Meta description:** 258 chars (aim 50–160).

6. **Em/en dashes:** 19 visible em/en dashes across page (counted on prose text, OG tags, JSON-LD descriptions).

### From accessibility audit

7. **404 page has no h1:** Verified against live deployed 404 — this repo's 404.html already has `<h1>That page is not part of the report.</h1>`. The audit FAIL belongs to the maintainer's user-site 404 at origin root (different repo). **No action needed** in this project (retracted in plan edit above).

8. **404 no skip link:** Keyboard tab order on 404 shows first focusable is "Go straight to" list; no skip link present. Since this project's 404 is minimal, adding a skip link is a nice UX win but does not affect the scored 404 (which is an error page for missing paths, not a primary navigation target). Optional.

9. **Skip link on home:** `jury` report `keyboard.skipLinkFirst: true` — home page has `#main` skip link. Passes.

### From WPO / performance

10. **Mobile LCP 1936 ms** — under 2.5 s threshold; passes.

11. **Mobile CLS 0.003** — under 0.05 threshold; passes.

12. **Page weight ~299 KB gzipped** — html 47 + JS 2 + CSS 10 + fonts 240 + images 0. Under 3 MB.

13. **No `#loader` element** — loaderMs: null; intro JS-gated reveal with 3 s timeout.

14. **`mobile.vitals` + `mobile.scrollFps`** — 60 fps on throttled phone; FPS worst-case 17 ms.

### From image/media audit

15. **Zero `loading="lazy"` on `<img>` tags** — site has 0 `<img>` tags in `index.html` (Leaflet map is canvas/SVG generated by JS; OSM tiles are CDN-served, not in markup; OG image is meta only, not `<img>` on page). No lazy-loading needed since there are no render-blocking images.

16. **`alt` text: 0 attributes** — no `<img>` elements on the static page. All informative imagery is in JSON-LD, OG meta, or Leaflet popups (dynamic). Acceptable for this content-first design.

### From security / headers audit

17. **npm audit:** 0 vulnerabilities.

18. **CSP:** meta CSP present and correct for static-site needs.

19. **Permissions-Policy:** present (`accelerometer=(), camera=(), ...`).

20. **No service worker** — pure static, acceptable for content site; no critical loss.

### From PWA / manifest audit

21. **Manifest present and valid:** name, short_name, description, start_url, scope, display standalone, orientation portrait-primary, background_color #FAFAF8, theme_color #FAFAF8, categories [news, education, reference], SVG favicon + PNG icons (192, 512, 180). ✅

22. **No cross-origin requests without SRI** — Leaflet JS fetched from unpkg without integrity hash in `<script>` tag (the `<noscript>` fallback loads the CSS, not JS; the main.js ES module loads Leaflet via `loadScript` with SRI). See below.

23. **`viewport-fit=cover`** in `<meta name="viewport">` — known iOS mobile overflow bug; content does not use edge-to-edge UI elements that would trigger it (paper layout with margins), so safe but removable if desired.

### From mobile UA / touch audit

24. **No `touch-action: manipulation`** on `body` — may cause scroll inertia / pull-to-refresh flicker on touch devices. Minimal fix.

25. **No `overscroll-behavior: contain`** on `html`/`body` — same pull-to-effect concern. Minimal fix.

26. **`100vh` not used** — no viewport-height units in CSS; layout uses `clamp()` and `%` / `rem` / `vw` only. Safe.

### From print / fallback audit

27. **Print styles present** (basic `:media print` block in `assets/css/site.css`); no `page-break-inside: avoid` on chapter `.sec-h2` or `.phase` sections; no hiding of nav/social for print. Minor enhancement.

### From dark mode audit

28. **`prefers-color-scheme` not used** — no dark mode. Site design is explicitly "cool-white paper (#FAFAF8), near-black ink (#1E232A)" — dark mode is a deliberate aesthetic choice, not a fault. No CSP conflict either (CSP `'unsafe-inline'` on styles already allows dark-mode toggle via meta or per-page CSS). Documented design decision.

### From code-quality audit

29. **ESLint:** passes (0 errors).

30. **TypeScript typecheck:** passes (`tsc --noEmit` exit 0).

31. **Prettier format check:** all matched files use Prettier code style (exit 0).

32. **Unit tests:** 99 passed (exit 0).

33. **Playwright e2e + a11y:** baseline passing; changes may require `--update-snapshots`.

34. **Lighthouse CI:** baseline will be generated on next `npm run lhci` run.

## Fix Plan — Ordered Steps

### Step 1 — Remove duplicate sentences (Content)
- In `index.html`, locate lines 1459 and 3181 with "Foreign arrivals fell from 12,102 to 1,325." and lines with "Scroll sideways to read the full table" duplicated.
- Remove/reword one copy of each. Keep meaning. Verify `npm run check:content` WARN gone; `npm run check:seo` content section clean.

### Step 2 — Fix meta description (Semantics/SEO)
- In `index.html`, rewrite the `<meta name="description" ...>` content attribute to ≤160 chars and ≥70 chars, keeping key figures (346 deaths, ₹1,200+ crore GST, 28,899 displaced) and keywords.
- Keep OG/Twitter descriptions consistent.

### Step 3 — Fix em-dash / AI-tell cleanup (Content)
- Replace 19 visible em/en dashes in prose text with standard punctuation (`-` for ranges, `--` or en-dash where semantically correct per site voice). Keep em-dash in `meta`/`og`/`twitter` metadata if stylistically intended; focus on visible prose.
- Re-run `npm run check:seo` to confirm WARN gone.

### Step 4 — Mobile tap targets ≥24×24 px (Responsive/Usability)
- In `assets/css/site.css`, add padding/inline-block hit areas for:
  - footnote-number references (`sup.ref` inside `fn-list` / `ki-table`) — currently 7×14 px.
  - source-list inline links (161×20 px mobile, 8×164 on some views).
- Use padding that does not distort text flow. For footnotes: `sup.ref { padding: 0 0.25rem; }` or similar to bring hit area to ≥24×24. For source links: add block display or sufficient padding.
- Verify at 390 px viewport via quick Playwright check or jury `shoot.mjs` re-run; re-run `npm run test:e2e` / visual tests.

### Step 5 — Add hover + focus-visible treatments (Animations/Transitions/Design)
- In `assets/css/site.css`, add `:hover` + `:focus-visible` styles for:
  - TOC anchor links (`.toc-list a`, `.chap-hdr .chap-subtitle`, `.sec-h2 a` inside nav).
  - Map control links ("Zoom in"/"Zoom out") — if these are anchors or buttons, give them real feedback (background color change on hover/focus, not just text color).
- Ensure `hover.noHoverChange` clears for primary interactive elements after re-run.

### Step 6 — Add `touch-action: manipulation` and `overscroll-behavior: contain` (Mobile UA)
- In `assets/css/site.css`, add to `body` or `html`:
  ```css
  body {
    touch-action: manipulation;
    overscroll-behavior: contain;
  }
  ```
- Verify on physical device or Chrome DevTools mobile throttle; no visual regression.

### Step 7 — Enhance print styles (Print)
- In `assets/css/site.css`, within the existing `@media print` block, add:
  - `page-break-inside: avoid` on `.sec-h2`, `.phase`, `.ki-table` elements.
  - Hide nav/social/leaflet for print: `@media print { .toc, .share, .leaflet-container { display: none; } }` (check which classes exist; may need selective hiding).
  - Keep chapter title and key tables visible.

### Step 8 — Add SRI on Leaflet script (Security)
- In `index.html`, the `<script type="module" src="assets/js/main.min.js">` loads `utils.js` → `map.js` which calls `loadScript({ src: LEAFLET_JS, integrity: LEAFLET_SRI })`. The Leaflet CDN URL `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` should have SRI on the `<script>` tag that loads it directly (in the `<noscript>` fallback or any direct script tag). Since Leaflet is only loaded via `loadScript` with SRI from JS, and the `<noscript>` only loads CSS, there is no direct `<script src="...">` in the HTML. **No change needed** — SRI is enforced in the JS loader. Verify: the `check:seo` or `audit.mjs` does not flag missing SRI on Leaflet script.

### Step 9 — Fix 404 page skip link and h1 audit (Accessibility — optional, verified already passing)
- **Retracted:** 404 h1 already present; skip link optional. No action needed for this project's 404.

## Verification Gates (run after fixes, in order)

```bash
npm run lint
npm run typecheck
npm run format:check
npm test                     # expect: 99+ passed
npm run check:seo            # expect: 0 FAIL, 0 WARN (meta desc, dashes, content)
npm run check:links
npm run check:content        # expect: 0 FAIL, 0 WARN
npm run test:e2e && npm run test:a11y   # e2e + a11y green
npm run test:visual          # may need --update-snapshots if visual baselines affected
```

Then re-run jury evidence:
```bash
PLAYWRIGHT_BROWSERS_PATH=/home/barun/Documents/manipur-economy/.pw-browsers \
  node /home/barun/.agents/skills/jury/scripts/shoot.mjs https://baruntayenjam.github.io/manipur-economy/ --crawl --max 8 --out <abs>/.jury/<host>/shots
node /home/barun/.agents/skills/jury/scripts/audit.mjs https://baruntayenjam.github.io/manipur-economy/
```

## Scope / Out of Scope

- **In scope:** the items above; plus any code the fixes require (CSS hit-area sizing, hover styles, meta description, copy dedup, print CSS, touch/overscroll, SRI).
- **Out of scope:** redesign, new sections, data corrections, new features, new dependencies. (Per user direction: fix plan only, not rebuild.)

## Risks / Escape Hatches

- Touching `assets/css/site.css` or JS may affect visual regression baselines → run `npm run test:visual -- --update-snapshots` only if intentional; otherwise adjust tests to match.
- Hover/map changes may require JS map controls (`assets/js/map.js`) — defer map wiring beyond CSS-level feedback if risky; ensure focus-visible at minimum.
- `touch-action: manipulation` / `overscroll-behavior: contain` may affect desktop scroll behavior minimally — test on both.
- If the `.btn` element is JS-injected (not in static 404.html), fix source accordingly (retracted: misattributed to different repo).

## Definition of Done (10 checks)

1. `npm run check:seo` passes with 0 FAILs, 0 WARNs.
2. `npm run check:content` passes with 0 FAILs, 0 WARNs.
3. Mobile tap targets all ≥24×24 px (verified via report/jury).
4. No primary interactive link in `hover.noHoverChange` / `colorOnly`.
5. Meta description ≤160 chars and ≥70.
6. 19 em/dashes removed/replaced; `check:seo` WARN gone.
7. `touch-action: manipulation` and `overscroll-behavior: contain` added to `body` in CSS; verified on mobile throttle.
8. Print styles enhanced with `page-break-inside: avoid` and selective hiding; `npm run test:visual` unchanged or updated intentionally.
9. Unit tests + lint + typecheck + format + e2e + a11y all green.
10. Jury re-run shows Usability ≥7, Animations ≥7 (or at minimum no regressions).

## Maintenance Note

- After fixes, re-run `/jury` once on live site to confirm score lift; record in `jury-scorecard.md`.
- Cache-bust: bump CSS `?v=` / JS version stamps per README "Updating the data" step 6.
- Future audits should re-run this same jury + best-practices workflow; keep findings in `jury-scorecard.md` and this plan.