# Plan 007: CSP via Meta Tags + Security Headers

**Category:** Security  
**Leverage:** MEDIUM  
**Effort:** S  
**Risk:** LOW  
**Depends On:** —  
**Base Commit:** `192477d`

## Problem

No Content Security Policy. GitHub Pages doesn't support HTTP headers, but CSP can be delivered via `<meta http-equiv="Content-Security-Policy">`. A 10/10 reference site should have CSP to mitigate XSS and injection risks.

## Current State

- Static HTML served via GitHub Pages
- External scripts: Chart.js (jsdelivr), Leaflet (unpkg) — both with SRI
- Inline styles: none (all in `assets/css/site.css`)
- Inline scripts: only the reveal failsafe in `<head>` (small, controlled)
- Fonts: self-hosted WOFF2
- Images: self-hosted + external (OG image, source PDFs)

## Implementation

### 1. Add CSP meta tag to `index.html` `<head>`

```html
<!-- After <meta charset="utf-8">, before other meta tags -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'sha256-<REVEAL_SAFESAFE_HASH>' https://cdn.jsdelivr.net https://unpkg.com;
  style-src 'self' 'unsafe-inline';
  font-src 'self' data:;
  img-src 'self' data: https:;
  connect-src 'self' https://cdn.jsdelivr.net https://unpkg.com https://tile.openstreetmap.org;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'none';
  upgrade-insecure-requests;
">
```

**Key decisions:**
- `script-src`: Allow self + CDN domains + inline reveal failsafe (via hash)
- `style-src`: `'unsafe-inline'` needed for Chart.js tooltip styles injected at runtime
- `font-src`: `'self' data:` for self-hosted WOFF2 + potential data: URIs
- `img-src`: `'self' data: https:` for self-hosted + external images (OG, sources)
- `connect-src`: Allow CDN fetches + OpenStreetMap tiles
- `upgrade-insecure-requests`: Force HTTPS for all subresources

### 2. Compute hash for reveal failsafe inline script

The inline script in `<head>`:
```html
<script>
  (function(){var r=document.querySelectorAll('.r')...
})();
</script>
```

Compute hash:
```bash
# Extract the exact script content (including whitespace)
cat > /tmp/reveal.js <<'EOF'
(function(){var r=document.querySelectorAll('.r');if(!r.length)return;var t=setTimeout(function(){document.documentElement.classList.add('js-ready');r.forEach(function(e){e.classList.add('v');});},3000);var o=new MutationObserver(function(e,n){e.forEach(function(e){e.addedNodes.forEach(function(e){e.nodeType===1&&e.matches&&e.matches('.r')&&e.classList.add('v');});});n.disconnect();});o.observe(document.documentElement,{childList:!0,subtree:!0});})();
EOF
# Compute sha256-base64
openssl dgst -sha256 -binary /tmp/reveal.js | openssl base64 -A
# Output: <HASH>
```

Replace `<REVEAL_SAFESAFE_HASH>` in CSP with the computed hash.

### 3. Add CSP verification to CI

```yaml
# .github/workflows/ci.yml - in check job
- name: Verify CSP meta tag
  run: |
    grep -q 'http-equiv="Content-Security-Policy"' index.html || { echo "CSP meta tag missing"; exit 1; }
    # Verify hash matches current inline script
    HASH=$(grep -o 'sha256-[^"]*' index.html | head -1 | cut -d'"' -f2)
    # Could verify hash matches but complex in CI; at least verify tag exists
```

### 4. Add `Referrer-Policy` and `Permissions-Policy` meta tags

```html
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta http-equiv="Permissions-Policy" content="accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()">
```

### 4. Add `X-Content-Type-Options` via GitHub Pages (not possible via meta)

GitHub Pages doesn't support custom headers. Document this limitation in `SECURITY.md`.

## Files to Modify

| File | Action |
|------|--------|
| `index.html` | Add CSP, Referrer-Policy, Permissions-Policy meta tags |
| `.github/workflows/ci.yml` | Add CSP verification step |

## Verification Commands

```bash
# Local: check CSP renders
grep -A5 'Content-Security-Policy' index.html

# Browser dev tools: Network → index.html → Headers → Content-Security-Policy
# Should show the policy

# Test CSP violations (open in browser, check Console):
# Should see no CSP violations
```

## Done Criteria

- [ ] CSP meta tag added to `index.html` with correct directives
- [ ] Inline script hash computed and included
- [ ] Referrer-Policy and Permissions-Policy meta tags added
- [ ] CI verifies CSP meta tag exists
- [ ] Browser console shows zero CSP violations on page load
- [ ] All functionality works: charts load, map loads, fonts load, images load
- [ ] No existing test regressions (`npm run check` passes)

## Escape Hatches

- If Chart.js tooltip styles blocked: `'unsafe-inline'` on `style-src` is intentional
- If Leaflet tiles blocked: verify `connect-src` includes `https://tile.openstreetmap.org`
- If hash mismatch: recompute after any change to reveal failsafe script
- If GitHub Pages adds header support: migrate to HTTP headers, remove meta tag

## Maintenance Notes

- Recompute hash if reveal failsafe script changes
- Review CSP quarterly for new dependencies
- Document any `'unsafe-inline'` exceptions in `SECURITY.md`
- Monitor browser console for CSP violations in production