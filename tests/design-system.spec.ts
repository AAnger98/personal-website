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

  test('Archivo Black is self-hosted (no Google Fonts link in head)', async ({ page }) => {
    await page.goto('/');
    const googleFontsLink = page.locator('link[href*="fonts.googleapis.com"]');
    await expect(googleFontsLink).toHaveCount(0);
  });
});
