/**
 * Visual regression — full-page + component snapshots.
 * Run: npm run test:visual
 * Update baselines: npm run test:visual:update
 */
import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

async function settle(page) {
  await expect(page.locator('html')).toHaveClass(/js-ready/, { timeout: 15_000 });
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    // 350px/150ms — IO reveal delivery is frame-timed, and faster jumps
    // (80ms dwell or less) drop callbacks leaving sections at opacity 0.
    for (let y = 0; y < h; y += 350) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  // Straggler pass: any element the observer missed is below the fold now and
  // can never intersect again — scroll to each straggler directly.
  await page.evaluate(async () => {
    const stuck = () => [...document.querySelectorAll('.r:not(.v)')];
    for (let pass = 0; pass < 3 && stuck().length; pass++) {
      for (const el of stuck()) {
        el.scrollIntoView({ block: 'center' });
        await new Promise((r) => setTimeout(r, 250));
      }
    }
    window.scrollTo(0, 0);
  });
  // Gate on every reveal having fired — otherwise the screenshot catches a
  // random subset of sections still at opacity 0 (flaky baselines).
  await page.waitForFunction(() => document.querySelectorAll('.r:not(.v)').length === 0, null, {
    timeout: 15_000,
  });
  await page.waitForTimeout(1200);
}

test.describe('Visual regression', () => {
  for (const vp of VIEWPORTS) {
    test.describe(`${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      // No full-page screenshot: the page is ~22–24k px tall, beyond
      // Chromium's 16,384 px single-capture texture limit, so Playwright
      // stitches viewport slices and the seams shift between captures —
      // "two consecutive stable screenshots" never converges. Structural
      // coverage lives in the e2e smoke suite (12 sections, takeaway,
      // no-JS fallback); visual precision lives in the component shots
      // below (hero / chart frames / map section).

      test('hero', async ({ page }) => {
        await page.goto('./', { waitUntil: 'domcontentloaded' }); // './' keeps subpath deploys (BASE_URL=…/manipur-economy/) on-origin
        await expect(page.locator('html')).toHaveClass(/js-ready/, { timeout: 15_000 });
        // Count-up runs 1200ms after reveal; wait for the longest figure to
        // settle so the screenshot is not mid-animation.
        await expect(page.locator('[data-count-to="28899"]')).toHaveText('28,899', {
          timeout: 10_000,
        });
        const hero = page.locator('main section').first();
        await expect(hero).toHaveScreenshot(`hero-${vp.name}.png`, {
          // Chart canvas is masked: it renders lazily, so an unmasked capture
          // races IntersectionObserver and flakes (chart has its own masked
          // test below).
          mask: [page.locator('#progress'), page.locator('#chart-death')],
          maxDiffPixels: 100,
        });
      });

      test('hero header (document header: title, meta, takeaway, key indicators)', async ({
        page,
      }) => {
        await page.goto('./', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('html')).toHaveClass(/js-ready/, { timeout: 15_000 });
        // .chap-hdr sits before the first section — the hero shot above
        // never covered it, leaving title/meta/takeaway ungated.
        await expect(page.locator('[data-count-to="28899"]')).toHaveText('28,899', {
          timeout: 10_000,
        });
        await expect(page.locator('.chap-hdr')).toHaveScreenshot(`chap-hdr-${vp.name}.png`, {
          mask: [page.locator('#progress')],
          maxDiffPixels: 100,
        });
      });

      test('chart frames (structure masked canvas)', async ({ page }) => {
        await page.goto('./', { waitUntil: 'domcontentloaded' }); // './' keeps subpath deploys (BASE_URL=…/manipur-economy/) on-origin
        await settle(page);
        for (const id of ['chart-death', 'chart-tourism', 'chart-disruption']) {
          // Capture the borderless .chart-body wrapper: the frame's 1px
          // hairline rasterizes a row off whenever any upstream height
          // changes, flipping baselines on every content edit. The frame
          // border itself is gated by unit tests + the e2e paint checks.
          const frame = page.locator('.chart-body').filter({ has: page.locator(`#${id}`) });
          await expect(frame).toHaveScreenshot(`chart-${id}-${vp.name}.png`, {
            mask: [page.locator(`canvas#${id}`)],
            maxDiffPixels: 100,
          });
        }
      });

      test('map section (structure, tiles masked)', async ({ page }) => {
        await page.goto('./', { waitUntil: 'domcontentloaded' }); // './' keeps subpath deploys (BASE_URL=…/manipur-economy/) on-origin
        await expect(page.locator('html')).toHaveClass(/js-ready/, { timeout: 15_000 });
        await page.locator('#map').scrollIntoViewIfNeeded();
        await expect(page.locator('#map')).toHaveClass(/leaflet-container/, { timeout: 15_000 });
        await page.waitForTimeout(800);
        const sec = page.locator('#map').locator('xpath=ancestor::section[1]');
        await expect(sec).toHaveScreenshot(`map-${vp.name}.png`, {
          mask: [page.locator('#map')],
          maxDiffPixels: 100,
        });
      });
    });
  }
});
