# Analytics (opt-in, off by default)

No analytics ships by default. Privacy default is enforced by unit test (no active analytics script in `index.html`).

## Enable (explicit owner opt-in only)
1. Use Plausible (or Umami). No Google Analytics. Cookieless, no cross-site tracking.
2. In `index.html`, uncomment the snippet in `<head>` and set `data-domain`:
   ```html
   <script defer data-domain="baruntayenjam.github.io" src="https://plausible.io/js/script.js"></script>
   ```
3. Add `https://plausible.io` to CSP `script-src` + `connect-src` in the CSP meta tag (see plan 007).
4. Verify: Network panel shows one `plausible.io` request; `npm run check` still green; no console CSP errors.

## Re-evaluate yearly; remove if unused. Never add GA without a new ADR.
