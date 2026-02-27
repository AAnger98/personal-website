import { test, expect } from '@playwright/test';

test.describe('Design system', () => {
  test('body has dark background (Terminal Deco palette)', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );
    // #1b3022 → rgb(27, 48, 34)
    expect(bg).toBe('rgb(27, 48, 34)');
  });

  test('Google Fonts stylesheet is referenced in document head', async ({ page }) => {
    await page.goto('/');
    const fontLink = page.locator('link[href*="Archivo+Black"]');
    await expect(fontLink).toHaveCount(1);
  });
});
