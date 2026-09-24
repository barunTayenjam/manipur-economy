# The Price of Conflict — Manipur's War Economy

> An interactive, source-verified data-journalism record documenting the
> economic impact of the **2023–2026 Manipur ethnic conflict**, set in the
> grammar of an official economic-survey chapter.

[![Live](https://img.shields.io/website?label=live&up_message=online&up_color=1a7f37&down_message=offline&down_color=cf222e&url=https%3A%2F%2Fbaruntayenjam.github.io%2Fmanipur-economy%2F)](https://baruntayenjam.github.io/manipur-economy/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Glossary/HTML5)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![No deps](https://img.shields.io/badge/dependencies-0-1a7f37)](#)
[![WCAG AA](https://img.shields.io/badge/WCAG-AA-passed-1a7f37)](#-performance--accessibility)
[![License](https://img.shields.io/github/license/barunTayenjam/manipur-economy?color=blue)](./LICENSE)
[![Last verified](https://img.shields.io/badge/data%20verified-20%20Sep%202026-blue)](#-data-verification)

**🔗 Live site:** https://baruntayenjam.github.io/manipur-economy/

Static site — semantic markup, one stylesheet, one script. No build step, no
framework, no API keys. Just serve the directory.

---

## ✨ Features

- **Survey-chapter layout** — eleven numbered chapters with a sticky contents
  rail (desktop) / contents strip (mobile), scroll-spy wayfinding.
- **Officials ledger** — source-linked index of Manipur's Chief Minister, Home Minister, Deputy CM, Governor, Supreme Court bench and key civic actors (UNC, Kuki Inpi/KSO, JTCM) with tenure windows and conflict-economy actions.
- **Statement of Key Indicators** — the report's opening booktabs table with
  count-up readings and numbered footnote markers linking to sources.
- **Booktabs statement tables** throughout — every key figure is a document
  row with a source line, never a dashboard widget.
- **Interactive Leaflet map** with 9 OSM-verified locations, real NH-2 / NH-37
  highway routes, categorized markers (capital · hotspots · border · nodes),
  a layer toggle, scale bar, and rich popups.
- **Horizontal chronology** — 20 dated events, May 2023 → September 2026.
- **Final ledger** — an 11-row consolidated balance sheet of losers and gainers.
- **12-question FAQ** — source-linked answers, mirrored in FAQPage JSON-LD.
- **Self-hosted fonts** (woff2, latin-subset, two preloads) — no font CDN.
- **WCAG AA compliant** — every text surface passes 4.5:1 contrast.
- **Fully responsive** — 320 px → 1920 px with zero horizontal overflow;
  `prefers-reduced-motion` honored.

## 🧱 Tech stack

| Layer | Choice |
|---|---|
| Markup | Semantic HTML5 (`index.html` — content + meta + JSON-LD only) |
| Styles | `assets/css/site.css` — hand-written CSS, custom properties, Grid/Flexbox. **No preprocessor, no Tailwind.** |
| Logic | `assets/js/site.js` — vanilla ES6 (IIFE). **No framework, no bundler, no dependencies** beyond the map library. |
| Maps | [Leaflet 1.9.4](https://leafletjs.com/) (CDN, lazy-loaded) + [OpenStreetMap](https://www.openstreetmap.org/copyright) tiles, grayscale-filtered |
| Fonts | [Spectral](https://fonts.google.com/specimen/Spectral) (document serif, display + body) · [Archivo](https://fonts.google.com/specimen/Archivo) (labels + tables, tnum) · [Spline Sans Mono](https://fonts.google.com/specimen/Spline+Sans+Mono) (figures, dates, source refs) |
| Icons | Inline SVG (custom paths, crimson strokes) |
| APIs | `IntersectionObserver` (map lazy-load, reveals, scroll-spy) · `requestAnimationFrame` (scroll progress) |

**Zero npm install. Zero build. Zero API keys.**

## 🎨 Design system

The full system is recorded in [`DESIGN.md`](./DESIGN.md); the product record
in [`PRODUCT.md`](./PRODUCT.md). In brief:

- **Aesthetic:** Economic-survey / budget-brief document grammar — cool-white
  paper (`#FAFAF8`), near-black ink (`#1E232A`), hairline rules, booktabs
  tables, zero shadows, zero border-radius. Flat by conviction.
- **Typography:** Spectral (display + body) under Archivo tracked small-caps
  labels; Spline Sans Mono carries every figure, date, and footnote marker
  (`tnum` throughout).
- **Color as data:** survey crimson (`#A31621`) = loss / links / chapter
  numbers; green (`#1A5C30`) = gain; amber (`#7A4F00`) = structural estimates.
  Never decoration.
- **Motion:** document behavior — instant state changes, gentle opacity/transform
  reveals, no layout-property animation.
- **Accessibility:** AA contrast throughout (audited programmatically),
  keyboard-reachable, 44 px touch targets, reduced-motion honored.

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
| Video statistics | confirmed live via [yt-dlp](https://github.com/yt-dlp/yt-dlp), Aug 2 2026 |
| 2026 blockade escalation (Sep 9), 140% commodity surge | The Hindu; Economic Times; Northeast Now |
| Blockade day-count (523 days since May 2023) | The Assam Tribune, Sep 18 2026 |
| Per-day blockade cost (research) | CLAWS, *Dynamics of Bandhs and Blockades*; ET 2011; Serto 2017 via ResearchGate |
| Internet shutdown / online-delivery timeline | SFLC internetshutdowns.in; KeepUsOnline |
| IDP resettlement (36,000 / 24,000) | CM statement via India Today NE, Sep 3 2026 |
| Bus resumption, JTCM NH-37 shutdown, US Ambassador visit | manipur.org; Imphal Times; E-Pao |

The full verified-source list (with deep links) is in the page colophon.

## 📁 Project structure

```
manipur-economy/
├── index.html            ← content, meta, JSON-LD
├── assets/
│   ├── css/site.css      ← the entire design system
│   ├── js/site.js        ← map, reveals, count-up, scroll-spy
│   └── fonts/            ← self-hosted woff2 (Spectral, Archivo, Spline Sans Mono)
├── PRODUCT.md            ← durable product record (audience, purpose, constraints)
├── DESIGN.md             ← design-system spec (tokens, rules, components)
├── README.md             ← this file
├── LICENSE               ← Apache 2.0
├── .nojekyll             ← tells GitHub Pages to serve raw (skip Jekyll)
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

- **Lighthouse-friendly:** no render-blocking JS, self-hosted subset fonts
  with `font-display: swap` and two critical preloads, Leaflet loaded only
  when the map plate approaches the viewport.
- **Contrast:** audited programmatically — every text surface passes WCAG AA
  (worst case 4.6:1; floor is 4.5:1).
- **Motion:** `prefers-reduced-motion` disables reveals, count-ups and map pulses.
- **Layout:** 0 px horizontal overflow at 320 / 390 / 768 / 1024 / 1440 / 1920 px;
  statement tables collapse to stacked document rows below 520 px.
- **No-JS:** all content visible without JavaScript; the map simply stays a plate.

## 🔄 Updating the data

The conflict is ongoing. To refresh figures:

1. Verify the new number against a primary source (PRS, NITI, major outlets).
2. Edit the relevant statement row / exhibit in `index.html`.
3. If it's an FAQ answer, update **both** the FAQ block and the `FAQPage`
   JSON-LD (they must stay in sync).
4. Add any new source to the colophon's verified-source list.
5. Re-run the contrast/overflow audit if layout changes.

## 📄 License

[Apache License 2.0](./LICENSE) — free to use, modify, and distribute with attribution.

Data figures remain the property of their respective sources (PRS India, NITI
Aayog, MoSPI, et al.) — cite them when reusing the numbers.

## 🙏 Methodology

Researched with [`last30days`](https://github.com/last30days) for social-source
discovery, cross-verified against government and major-outlet reporting, and
live-checked with `yt-dlp`. Full methodology note is in the page colophon.
