# The Price of Conflict — Manipur's War Economy

An interactive, Awwwards-style data-journalism infographic documenting the
economic impact of the 2023–2026 Manipur ethnic conflict.

**Live site:** _add your GitHub Pages URL after publishing_
`https://<your-username>.github.io/manipur-economy/`

## What's inside

A single self-contained `index.html` (no build step) covering six panels:

1. **The Baseline** — strategic geography + economic indicators (interactive Leaflet map)
2. **The Losers** — farmers, daily-wage workers, transport, tourism, youth
3. **The Gainers** — drug economy, security contractors, media, arms trade
4. **The Shadow Economy** — the Golden Triangle drug-funding loop
5. **The Economic Toll** — sectoral damage estimates
6. **The Final Ledger** — who loses, who gains balance sheet
7. **Timeline** — key milestones, May 2023 → June 2026

## Data verification

Every figure is either **primary-source verified** or **explicitly labeled as a
structural estimate**:

- Economic data → PRS India, NITI Aayog, Economic Survey of Manipur 2024-25
- Human cost & politics → Wikipedia, Human Rights Watch, The Hindu, India Today, Times of India
- Video statistics → confirmed live via yt-dlp (June 19, 2026)
- Geography → OpenStreetMap (Nominatim)

See the in-page footer for the full verified-source list.

## Tech

- Plain HTML/CSS/vanilla JS — no framework, no bundler
- [Leaflet](https://leafletjs.com/) + CARTO dark tiles for the map
- Plus Jakarta Sans + Playfair Display (Google Fonts)
- Zero external API keys required

## Run locally

Just open `index.html` in a browser. Or serve it:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## License

CC BY 4.0 — attribute to the data sources listed in the page footer.
