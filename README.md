# The Price of Conflict — Manipur's War Economy

> An interactive, Awwwards-tier data-journalism infographic documenting the
> economic impact of the **2023–2026 Manipur ethnic conflict**.

**🔗 Live site:** https://baruntayenjam.github.io/manipur-economy/

A single self-contained `index.html` — no build step, no framework, no API keys.
Just open it and it works.

---

## ✨ Features

- **Interactive Leaflet map** with 9 OSM-verified locations, real NH-2 / NH-37
  highway routes, categorized pulsing markers (capital · hotspots · border · nodes),
  a layer toggle, scale bar, and rich popups.
- **Six analytical panels** + a horizontal timeline spanning May 2023 → June 2026.
- **Double-Bezel ("Doppelrand") card architecture** — every container is a machined
  nested shell, not a flat box.
- **Cinematic motion** — staggered scroll reveals, magnetic hover physics,
  fluid-island navigation, GPU-safe (transform/opacity only).
- **Side dot-navigation** with scroll-spy wayfinding across all panels.
- **Custom ultra-light SVG icon system** (14 icons, 1.3px stroke) — no emoji, no icon font.
- **WCAG AA compliant** — every text element passes 4.5:1 contrast.
- **Fully responsive** — 390 px mobile → 1440 px+ desktop, with `prefers-reduced-motion` support.

## 🧱 Tech stack

| Layer | Choice |
|---|---|
| Markup | Semantic HTML5 |
| Styles | Hand-written CSS3 — custom properties, Grid, Flexbox, keyframes. **No preprocessor, no Tailwind.** |
| Logic | Vanilla JavaScript (ES6+, IIFE). **No framework, no bundler, no dependencies** beyond the map library. |
| Maps | [Leaflet 1.9.4](https://leafletjs.com/) + [CARTO Dark Matter](https://carto.com/basemaps/) tiles |
| Fonts | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (UI) · [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) (display serif) |
| Icons | Inline SVG (custom set, hand-drawn paths) |
| APIs | `IntersectionObserver` (reveals) · `requestAnimationFrame` (scroll progress) · [OSM Nominatim](https://nominatim.org/) (geocoding, verification only) |

**Zero npm install. Zero build. Zero API keys.** The entire experience ships in one file.

## 🎨 Design system

- **Aesthetic:** Ethereal-Glass dark editorial — deepest warm-black (`#0A0806`),
  radial mesh-gradient orbs, 3% film-grain overlay.
- **Typography scale:** display serif (Playfair, italic accents) over a geometric
  grotesk (Plus Jakarta), with `tnum` tabular figures for all statistics.
- **Motion:** custom cubic-bézier curves (`0.32,0.72,0,1`) — never `linear`/`ease-in-out`.
- **Color tokens:** warm gold (`#D4AC7D`) primary, with loss (`#DD6244`) and
  gain (`#82B36E`) semantic accents.
- **Accessibility:** AA contrast throughout, keyboard-reachable, reduced-motion honored.

## 📊 Data verification

Every figure in the page is either **primary-source verified** or **explicitly
labeled as a structural estimate**. Nothing is fabricated.

| Domain | Sources |
|---|---|
| Macro economy (GSDP, growth) | PRS India — Manipur Budget Analysis 2024-25 |
| Demographics & fiscal | NITI Aayog — Macro & Fiscal Landscape of Manipur |
| Per-capita income | Economic Survey of Manipur 2024-25; MoSPI (national) |
| Casualties & displacement | Wikipedia; Human Rights Watch; Times of India |
| Political events | The Hindu; India Today |
| Agriculture loss | The Hindu (LOUSAL farmers'-body survey, ₹226 cr) |
| Drug-trade route | UNODC; IDSA; ORF |
| Geography & coordinates | OpenStreetMap (Nominatim) |
| Video statistics | confirmed live via [yt-dlp](https://github.com/yt-dlp/yt-dlp), June 19 2026 |

The full verified-source list (with deep links) is in the page footer.

## 📁 Project structure

```
manipur-economy/
├── index.html      ← the entire infographic (HTML + CSS + JS inline)
├── README.md       ← this file
├── LICENSE         ← Apache 2.0
├── .nojekyll       ← tells GitHub Pages to serve raw (skip Jekyll)
└── .gitignore
```

## 🛠 Run locally

```bash
# option 1 — just open the file
open index.html            # macOS
xdg-open index.html        # Linux
start index.html           # Windows

# option 2 — local server (recommended, avoids any CORS quirks)
python3 -m http.server 8000
# → http://localhost:8000
```

## 🚀 Deploy

Hosted on **GitHub Pages** (free). Any static host works (Netlify, Vercel,
Cloudflare Pages, S3) — just serve the directory.

```bash
git add -A && git commit -m "update" && git push
# GitHub Pages auto-redeploys in ~30–60s
```

## ♿ Performance & accessibility

- **Lighthouse-friendly:** no render-blocking JS, system-font fallbacks,
  `will-change` used sparingly, `backdrop-filter` only on fixed/sticky elements.
- **Contrast:** audited programmatically — 36/36 text groups pass WCAG AA
  (worst case 6.6:1; floor is 4.5:1).
- **Motion:** `prefers-reduced-motion` disables all animations.
- **Layout:** 0 px horizontal overflow at every breakpoint; no layout-thrash
  scroll handlers (rAF-throttled, passive).

## 🔄 Updating the data

The conflict is ongoing. To refresh figures:

1. Verify the new number against a primary source (PRS, NITI, major outlets).
2. Edit the relevant card in `index.html`.
3. Update the source attribution + the footer's verified-source list.
4. Re-run the contrast/overflow audit (Playwright script in the project history)
   if layout changes.

## 📄 License

[Apache License 2.0](./LICENSE) — free to use, modify, and distribute with attribution.

Data figures remain the property of their respective sources (PRS India, NITI
Aayog, MoSPI, et al.) — cite them when reusing the numbers.

## 🙏 Methodology

Researched with [`last30days`](https://github.com/last30days) for social-source
discovery, cross-verified against government and major-outlet reporting, and
live-checked with `yt-dlp`. Full methodology note is in the page footer.
