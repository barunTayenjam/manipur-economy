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

    await page.goto('./', { waitUntil: 'domcontentloaded' }); // './' keeps subpath deploys (BASE_URL=…/manipur-economy/) on-origin
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

    // Structural markers (section[id]: Leaflet's layers control injects its
    // own <section> inside #map, so a bare 'section' count is 13)
    await expect(page.locator('section[id]')).toHaveCount(12);
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
      const r = await request.get(`./assets/js/${f}`);
      expect(r.status(), f).toBe(200);
    }
    const legacy = await request.get('./assets/js/site.js');
    expect(legacy.status()).toBe(404);

    for (const f of ['data/charts.json', 'data/map.geo.json']) {
      const r = await request.get(`./${f}`);
      expect(r.status(), f).toBe(200);
      const body = await r.json();
      expect(body).toBeTruthy();
    }
  });

  test('scroll spy highlights the section in view and nothing at the top', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('html')).toHaveClass(/js-ready/);
    await page.waitForTimeout(400);
    await expect(page.locator('.toc-list a.active')).toHaveCount(0);
    await page.locator('#timeline').scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await expect(page.locator('.toc-list a[href="#timeline"]')).toHaveClass(/active/);
  });

  test('human-toll figures render at full value (no count-up)', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('html')).toHaveClass(/js-ready/);
    await page.waitForTimeout(2500);
    await expect(page.locator('[data-count-to="306"]')).toHaveText('306');
    await expect(page.locator('[data-count-to="28899"]')).toHaveText('28,899');
  });

  test('footnote refs deep-link to the hero footnotes; FAQ anchors open the item', async ({
    page,
  }) => {
    await page.goto('./');
    const firstRef = page.locator('sup.ref a').first();
    const href = await firstRef.getAttribute('href');
    expect(href).toMatch(/^#fn-\d+$/);
    await expect(page.locator(href)).toHaveCount(1);

    await page.goto('./#faq-2');
    await page.waitForTimeout(300);
    await expect(page.locator('#faq-2')).toHaveAttribute('open', '');
  });

  // Footnote numbers are hard-coded .fn-num spans; a CSS ::before counter
  // once rendered alongside them ("1 1", "2 2" …). Gate on the combination.
  test('footnote lists are not double-numbered', async ({ page }) => {
    await page.goto('./', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveClass(/js-ready/, { timeout: 15_000 });
    const doubled = await page.evaluate(
      () =>
        [...document.querySelectorAll('li')].filter((li) => {
          const span = li.querySelector(':scope > .fn-num');
          if (!span || getComputedStyle(span).display === 'none') return false;
          const before = getComputedStyle(li, '::before');
          const c = before.content;
          return before.display !== 'none' && c && c !== 'none' && c !== 'normal' && c !== '""';
        }).length
    );
    expect(doubled, 'li elements showing both a ::before number and .fn-num').toBe(0);
  });

  // README promises 0 px horizontal overflow from 320 px up — assert it.
  test('no horizontal overflow at 320/390/768/1024/1280', async ({ page }) => {
    await page.goto('./', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveClass(/js-ready/, { timeout: 15_000 });
    for (const width of [320, 390, 768, 1024, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForTimeout(150);
      const overflow = await page.evaluate(() => ({
        docW: document.documentElement.scrollWidth,
        winW: window.innerWidth,
      }));
      expect(overflow.docW, `${width} px viewport`).toBeLessThanOrEqual(overflow.winW);
    }
  });
});
