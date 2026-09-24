# Plan 001: Lighthouse CI + Performance Budgets

**Category:** Performance  
**Leverage:** HIGH  
**Effort:** M  
**Risk:** LOW  
**Depends On:** —  
**Base Commit:** `192477d`

## Problem

No performance budgets or regression detection. A "source of truth" reference site must meet strict Core Web Vitals targets and prevent regressions.

## Current State

- Static HTML + ES modules + Chart.js + Leaflet (lazy-loaded)
- No build step (intentional — zero config)
- HTML: ~146KB (includes inline CSS/JS for fonts, icons)
- Fonts: 2 self-hosted WOFF2 families (Spectral, Archivo, Spline Sans Mono)
- CDN: Chart.js (jsdelivr), Leaflet (unpkg) — both with SRI
- CI: Runs on ubuntu-latest, no Lighthouse

## Targets (10/10 Standard)

| Metric | Budget | Rationale |
|--------|--------|-----------|
| LCP | ≤ 2.5s | Good Core Web Vital |
| CLS | ≤ 0.1 | Good Core Web Vital |
| TBT | ≤ 200ms | Good Core Web Vital |
| Performance Score | ≥ 95 | Elite tier |
| Accessibility Score | = 100 | Already passing axe |
| Best Practices | ≥ 95 | Security, modern APIs |
| SEO | = 100 | Source of truth |

## Implementation

### 1. Add Lighthouse CI to package.json

```json
// package.json additions
"devDependencies": {
  ...
  "@lhci/cli": "^0.14.0"
},
"scripts": {
  ...
  "lhci": "lhci autorun",
  "lhci:collect": "lhci collect --url=http://127.0.0.1:4173 --collect.settings.preset=desktop --collect.settings.headless=true",
  "lhci:assert": "lhci assert"
}
```

### 2. Create `lighthouserc.json` at repo root

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "python3 -m http.server 4173 --bind 127.0.0.1",
      "url": ["http://127.0.0.1:4173/"],
      "settings": {
        "preset": "desktop",
        "headless": true,
        "budgets": [
          {"resourceType": "total", "budget": 200},
          {"resourceType": "script", "budget": 50},
          {"resourceType": "css", "budget": 30},
          {"resourceType": "font", "budget": 80},
          {"resourceType": "image", "budget": 50},
          {"resourceType": "third-party", "budget": 100}
        ]
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 1.0 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 1.0 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }],
        "bootup-time": ["warn", { "maxNumericValue": 1500 }],
        "uses-rel-preload": ["warn", { "minScore": 1.0 }],
        "uses-text-compression": ["error", { "minScore": 1.0 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### 3. Add Lighthouse CI job to `.github/workflows/ci.yml`

```yaml
# Add to jobs section, after e2e
lighthouse:
  name: Lighthouse CI
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 22
        cache: npm
    - name: Install dependencies
      run: npm ci
    - name: Run Lighthouse CI
      run: npm run lhci
      env:
        LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

**Note:** For initial runs without GitHub App token, use `target: temporary-public-storage` (no auth needed). Later, configure LHCI GitHub App for PR comments.

### 4. Verify locally

```bash
npm ci
npm run lhci
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `package.json` | Add @lhci/cli, lhci scripts |
| `lighthouserc.json` | Create (new) |
| `.github/workflows/ci.yml` | Add lighthouse job |

## Verification Commands

```bash
# Local verification
npm ci
npm run lhci
# Must output: "LHCI: All assertions passed" or fail with specific budget violations

# CI verification
# Check GitHub Actions: Lighthouse CI job passes
```

## Done Criteria

- [ ] `npm run lhci` passes locally with all assertions green
- [ ] Lighthouse CI job added to CI workflow
- [ ] CI run shows Lighthouse job passing
- [ ] Performance budgets documented in `lighthouserc.json`
- [ ] No existing test regressions (`npm run check` passes)

## Escape Hatches

- If LCP > 2.5s due to font loading: add `font-display: swap` (already in CSS), consider preloading critical font
- If third-party budget exceeded: self-host Chart.js/Leaflet or accept with documented justification
- If CI flaky: increase `numberOfRuns` to 5, add median aggregation

## Maintenance Notes

- Update budgets when adding features (new charts, images)
- Monitor LHCI GitHub App for PR comment integration
- Revisit budgets quarterly — tighten as optimization opportunities arise