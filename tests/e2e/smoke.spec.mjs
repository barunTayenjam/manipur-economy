/**
 * E2E smoke — module boot, charts painted, map mounts, no page errors.
 * Run: npm run test:e2e
 */
import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('boots ES modules, paints 3 charts, mounts map', async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e)));
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text());
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveClass(/js-ready/, { timeout: 15_000 });
    await expect(page.locator('html')).toHaveClass(/js/);

    // Scroll through to trigger IO for charts + map
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 350) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 80));
      }
    });
    await page.waitForTimeout(2500);

    // js-ready stays true (failsafe must not have been needed)
    await expect(page.locator('html')).toHaveClass(/js-ready/);

    // Three canvases painted
    for (const id of ['chart-death', 'chart-tourism', 'chart-disruption']) {
      const painted = await page.evaluate((canvasId) => {
        const c = document.getElementById(canvasId);
        if (!c) return { exists: false };
        try {
          const ctx = c.getContext('2d');
          const { width: w, height: h } = c;
          if (!w || !h) return { exists: true, painted: false };
          const d = ctx.getImageData(0, 0, w, h).data;
          let nonZero = 0;
          for (let i = 3; i < d.length; i += 4) if (d[i] !== 0) nonZero++;
          return { exists: true, painted: nonZero > 100 };
        } catch {
          return { exists: true, painted: false };
        }
      }, id);
      expect(painted.exists, `${id} should exist`).toBe(true);
      expect(painted.painted, `${id} should have non-empty pixels`).toBe(true);
    }

    // Map mounts Leaflet
    await page.locator('#map').scrollIntoViewIfNeeded();
    await expect(page.locator('#map')).toHaveClass(/leaflet-container/, { timeout: 15_000 });

    // Structural markers
    await expect(page.locator('section')).toHaveCount(12);
    await expect(page.locator('.takeaway-hero')).toHaveCount(1);
    await expect(page.locator('.sec-takeaway[style]')).toHaveCount(0);

    // No fatal page errors. Tile aborts during scroll are OK.
    const fatalConsole = consoleErrors.filter(
      (e) => !e.includes('net::ERR') && !e.includes('favicon') && !e.includes('ERR_ABORTED')
    );
    expect(pageErrors, `pageerrors: ${pageErrors.join('; ')}`).toEqual([]);
    expect(fatalConsole, `console: ${fatalConsole.join('; ')}`).toEqual([]);
  });

  test('serves modular assets; legacy site.js is gone', async ({ request }) => {
    for (const f of ['main.js', 'utils.js', 'charts.js', 'map.js']) {
      const r = await request.get(`/assets/js/${f}`);
      expect(r.status(), f).toBe(200);
    }
    const legacy = await request.get('/assets/js/site.js');
    expect(legacy.status()).toBe(404);

    for (const f of ['data/charts.json', 'data/map.geo.json']) {
      const r = await request.get(`/${f}`);
      expect(r.status(), f).toBe(200);
      const body = await r.json();
      expect(body).toBeTruthy();
    }
  });
});
