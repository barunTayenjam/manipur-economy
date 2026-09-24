# Plan 014: Privacy-Friendly Analytics (Optional, Off by Default)

**Category:** Analytics
**Leverage:** LOW
**Effort:** S
**Risk:** LOW
**Depends On:** 007 (CSP must allow the analytics domain if enabled)
**Base Commit:** `192477d`

## Problem
No usage signal. But a source-of-truth report must not trade privacy for metrics. Default: OFF. Enable only with explicit owner opt-in.

## Decision
Plausible (or Umami) with cookieless, no cross-site tracking. No Google Analytics. Feature-flagged so the site works identically with analytics absent.

## Implementation
1. Add `docs/analytics.md`: how to enable — set `window.__ANALYTICS_SRC=https://plausible.io/js/script.js` + `data-domain` before `main.js`; document CSP addition (`script-src` + `connect-src` add `https://plausible.io`).
2. In `index.html`, add commented-out snippet (never active by default):
   ```html
   <!-- Analytics (opt-in): uncomment + set data-domain, then add plausible.io to CSP in 007
   <script defer data-domain="baruntayenjam.github.io" src="https://plausible.io/js/script.js"></script>
   -->
   ```
3. In `assets/js/main.js`: no code change required (deferred script auto-tracks pageview). If enabled later, add `connect-src https://plausible.io` to CSP meta (plan 007 file).
4. Unit test: assert the snippet stays commented out by default (privacy default) — `!<script[^>]*plausible` active; comment presence OK.

## Files
| File | Action |
|------|--------|
| `docs/analytics.md` | Create |
| `index.html` | Add commented snippet only |
| `tests/unit.test.mjs` | Assert no active analytics script |

## Verification
```bash
node -e "const h=require('fs').readFileSync('index.html','utf8'); if(/<script[^>]*plausible[^>]*>/.test(h.replace(/<!--[\s\S]*?-->/g,''))){console.error('analytics active!');process.exit(1)}else{console.log('analytics off by default: OK')}"
node tests/unit.test.mjs 2>&1 | tail -2
```

## Done Criteria
- [ ] Docs explain opt-in; snippet commented; privacy default enforced by test
- [ ] CSP guidance documented for future enablement
- [ ] `npm run check` green, no new requests in Network panel

## Maintenance
- Re-evaluate yearly; remove if unused. Never add GA without new ADR.
