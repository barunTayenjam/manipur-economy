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
    for (let y = 0; y < h; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
}

const MASKS = (page) => [
  page.locator('canvas#chart-death'),
  page.locator('canvas#chart-tourism'),
  page.locator('canvas#chart-disruption'),
  page.locator('#map'),
  page.locator('#progress'),
];

test.describe('Visual regression', () => {
  for (const vp of VIEWPORTS) {
    test.describe(`${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test('full page', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await settle(page);
        await expect(page).toHaveScreenshot(`full-page-${vp.name}.png`, {
          fullPage: true,
          mask: MASKS(page),
          // Full page includes tiles/fonts/scroll-position variance: smoke-level tolerance.
          // Precision is enforced by hero/chart/map component shots below.
          maxDiffPixels: 2500,
        });
      });

      test('hero', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await expect(page.locator('html')).toHaveClass(/js-ready/, { timeout: 15_000 });
        const hero = page.locator('main section').first();
        await expect(hero).toHaveScreenshot(`hero-${vp.name}.png`, {
          mask: [page.locator('#progress')],
          maxDiffPixels: 100,
        });
      });

      test('chart frames (structure masked canvas)', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await settle(page);
        for (const id of ['chart-death', 'chart-tourism', 'chart-disruption']) {
          const frame = page.locator(`#${id}`).locator('..');
          await expect(frame).toHaveScreenshot(`chart-${id}-${vp.name}.png`, {
            mask: [page.locator(`canvas#${id}`)],
            maxDiffPixels: 100,
          });
        }
      });

      test('map section (structure, tiles masked)', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
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
