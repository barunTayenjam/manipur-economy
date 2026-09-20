# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: researchers, journalists, and policy analysts who arrive to verify figures and cite them in their own writing. They return repeatedly, hunt for exact numbers, and follow source links. Secondary: general readers arriving via shared links who read top-to-bottom once.

## Product Purpose

An interactive, data-verified visual report on the economic impact of the 2023–26 Manipur ethnic conflict. It exists to make a fractured war economy legible: who loses, who gains, what the shadow economy captures, what the human toll is. Success means the page is trusted as a canonical citation — figures get reused and sourced, not just skimmed.

## Positioning

Every figure is primary-source verified (PRS India, NITI Aayog, Economic Survey of Manipur, HRW, The Hindu, Times of India) and presented as an interactive visual report rather than a plain article. A neighboring news piece could not truthfully claim the same per-figure source discipline plus the interactive map, timeline, and phase structure.

## Operating Context

Single-page static site (GitHub Pages). Readers arrive cold via search, social, and the OG card. Reading is long-form: phases → baseline → losers/gainers → shadow economy → toll → timeline → ledger → FAQ. The Leaflet/OSM map is a working reference tool, not decoration.

## Capabilities and Constraints

- Static site, no framework, no build step. Markup in `index.html`; world CSS in `assets/css/site.css`; behavior in `assets/js/site.js`. Self-hosted woff2 fonts in `assets/fonts/`.
- Leaflet 1.9.4 from unpkg; OpenStreetMap tiles. Self-hosted woff2 fonts only.
- All verified content, source attributions, JSON-LD schema (Article/Dataset/Event/FAQ), OG/Twitter meta, sitemap, and PWA files must be preserved verbatim across redesigns.
- Data through September 2026; temporal window May 2023 – Sep 2026.

## Brand Commitments

No invented figures, no fabricated commercial claims, no synthetic imagery presented as photojournalism. Synthetic or illustrative material must be labeled.

## Evidence on Hand

- `DATA_EXTRACTED.md` (30K) — extracted verified dataset.
- `manipur-economy-conflict-raw.md` (43K) — raw source compilation.
- All figures carry inline source citations in the incumbent build.
- Assets: favicon set, OG image, self-hosted fonts (Plus Jakarta Sans, Playfair Display — current world; a redesign may replace).

## Product Principles

1. Verifiability is the product: every number a reader can trace in one click.
2. The data leads; the interface recedes. Comprehension and wayfinding outrank expression.
3. One continuous argument (fracture → losers/gainers → shadow capture → toll), not a dashboard of widgets.
4. Cite-and-return behavior must be supported: stable anchors, scannable figures, printable.

## Accessibility & Inclusion

WCAG AA contrast, reduced-motion support, skip-link, semantic section structure, no-JS fallback with all content visible — all required in any rebuild.
