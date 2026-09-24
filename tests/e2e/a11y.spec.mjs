/**
 * axe-core accessibility gate — fails CI on serious/critical violations.
 * Run: npm run test:a11y
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('accessibility', () => {
  test('has no serious or critical axe violations', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Let reveal settle so hidden-but-present content is in a11y tree after scroll
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 50));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (blocking.length) {
      const detail = blocking
        .map(
          (v) =>
            `${v.id} (${v.impact}): ${v.help}\n  nodes: ${v.nodes
              .slice(0, 3)
              .map((n) => n.target.join(' '))
              .join(' | ')}`
        )
        .join('\n');
      expect(blocking, `axe serious/critical:\n${detail}`).toEqual([]);
    }

    expect(blocking).toEqual([]);
  });
});
