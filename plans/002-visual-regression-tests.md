# Plan 002: Visual Regression Tests (Playwright Screenshot Diff)

**Category:** Testing  
**Leverage:** HIGH  
**Effort:** M  
**Risk:** LOW  
**Depends On:** 001 (Lighthouse CI for performance baseline)  
**Base Commit:** `192477d`

## Problem

No visual regression detection. Design changes (intentional or accidental) go unnoticed until manual review. A 10/10 reference site needs pixel-perfect consistency guarantees.

## Current State

- Playwright configured with `trace: 'retain-on-failure'` in CI, `'off'` locally
- 2 smoke tests + 1 a11y test
- No screenshot comparison
- Fonts: self-hosted WOFF2 (consistent rendering)
- Charts: Chart.js canvas (non-deterministic rendering — needs masking)
- Map: Leaflet tiles (external — needs masking)

## Approach

Use Playwright's built-in `toHaveScreenshot` with:
- Baseline screenshots committed to repo (`tests/visual/baselines/`)
- Mask charts (`canvas#chart-*`) and map (`#map`) — they're externally rendered
- Test key viewports: desktop (1280px), tablet (768px), mobile (375px)
- Update baselines via `npx playwright test --update-snapshots`

## Implementation

### 1. Add visual test file: `tests/visual/visual.spec.mjs`

```javascript
/**
 * Visual regression — full-page + component snapshots.
 * Run: npx playwright test tests/visual/visual.spec.mjs
 * Update baselines: npx playwright test tests/visual/visual.spec.mjs --update-snapshots
 */
import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

test.describe('Visual regression', () => {
  for (const vp of VIEWPORTS) {
    test.describe(`${vp.name} (${vp.width}x${vp.height})`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test('full page', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('html')).toHaveClass(/js-ready/, { timeout: 15_000 });

        // Scroll to trigger all reveals
        await page.evaluate(async () => {
          const h = document.body.scrollHeight;
          for (let y = 0; y < h; y += 500) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 50));
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(1500);

        // Mask dynamic content: charts (canvas) + map (tiles)
        await expect(page).toHaveScreenshot(`full-page-${vp.name}.png`, {
          fullPage: true,
          mask: [
            page.locator('canvas#chart-death'),
            page.locator('canvas#chart-tourism'),
            page.locator('canvas#chart-disruption'),
            page.locator('#map'),
            page.locator('#progress'), // scroll progress bar changes
          ],
          maxDiffPixels: 100, // tolerance for anti-aliasing
          threshold: 0.1,
        });
      });

      test('hero section', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('html')).toHaveClass(/js-ready/);
        const hero = page.locator('.hero, header, section:first-of-type').first();
        await expect(hero).toHaveScreenshot(`hero-${vp.name}.png`, {
          mask: [page.locator('#progress')],
        });
      });

      test('chart frames', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('html')).toHaveClass(/js-ready/);
        await page.evaluate(async () => {
          const h = document.body.scrollHeight;
          for (let y = 0; y < h; y += 500) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 50));
          }
        });
        await page.waitForTimeout(1500);

        for (const id of ['chart-death', 'chart-tourism', 'chart-disruption']) {
          const frame = page.locator(`#${id}`).locator('..'); // .chart-frame
          await expect(frame).toHaveScreenshot(`chart-${id}-${vp.name}.png`, {
            mask: [page.locator(`canvas#${id}`)],
          });
        }
      });

      test('map section', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('html')).toHaveClass(/js-ready/);
        await page.locator('#map').scrollIntoViewIfNeeded();
        await expect(page.locator('#map')).toHaveClass(/leaflet-container/, { timeout: 15_000 });
        await page.waitForTimeout(1000);

        const mapSection = page.locator('#map').locator('..'); // .chart or section
        await expect(mapSection).toHaveScreenshot(`map-${vp.name}.png`, {
          mask: [page.locator('#map')],
        });
      });
    });
  }
});
```

### 2. Update `playwright.config.mjs` for visual tests

```javascript
// Add to projects array
{
  name: 'visual',
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 720 },
  },
},
{
  name: 'visual-tablet',
  use: {
    ...devices['iPad Pro'],
  },
},
{
  name: 'visual-mobile',
  use: {
    ...devices['iPhone 13'],
  },
},
```

### 3. Add npm script

```json
// package.json
"scripts": {
  ...
  "test:visual": "playwright test tests/visual/visual.spec.mjs",
  "test:visual:update": "playwright test tests/visual/visual.spec.mjs --update-snapshots"
}
```

### 4. Add CI job (optional — run on PR only, not every push)

```yaml
# .github/workflows/ci.yml
visual:
  name: Visual Regression
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 22
        cache: npm
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright browsers
      run: npx playwright install --with-deps chromium
    - name: Visual regression tests
      run: npm run test:visual
    - name: Upload visual diff on failure
      if: failure()
      uses: actions/upload-artifact@v4
      with:
        name: visual-diff
        path: test-results/
        retention-days: 7
```

### 5. Generate initial baselines

```bash
npm ci
npx playwright install --with-deps chromium
npm run test:visual:update
# Commits baselines to tests/visual/baselines/
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `tests/visual/visual.spec.mjs` | Create (new) |
| `playwright.config.mjs` | Add visual projects |
| `package.json` | Add visual scripts |
| `.github/workflows/ci.yml` | Add visual job (PR only) |
| `tests/visual/baselines/` | Created by `--update-snapshots` (commit) |

## Verification Commands

```bash
# Generate baselines
npm run test:visual:update
# Should create screenshots in tests/visual/baselines/

# Run visual tests (should pass with 0 diff)
npm run test:visual
# All tests pass

# CI: visual job passes on PR
```

## Done Criteria

- [ ] `npm run test:visual:update` creates baselines for 3 viewports × 4 test types = 12+ screenshots
- [ ] `npm run test:visual` passes with 0 pixel diff
- [ ] Visual regression job added to CI (PR-only)
- [ ] Baselines committed to repo
- [ ] Charts and map masked correctly (no false positives from tile/render variance)
- [ ] No existing test regressions (`npm run check` passes)

## Escape Hatches

- If chart canvas rendering differs across OS: increase `maxDiffPixels` for chart frames, or mask entire `.chart-frame`
- If map tiles differ: mask entire `#map` parent section
- If flaky on CI: add `retries: 2` for visual project only

## Maintenance Notes

- Update baselines intentionally via `npm run test:visual:update` + commit
- Review diffs in PR artifacts before approving baseline updates
- Add new component tests as UI expands