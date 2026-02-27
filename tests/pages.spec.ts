import { test, expect } from '@playwright/test';

// ─── About page ──────────────────────────────────────────────────────────────

test.describe('About page', () => {
  test('loads without error and has a heading', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('has body content (not an empty page)', async ({ page }) => {
    await page.goto('/about');
    const mainText = await page.locator('main').textContent();
    expect(mainText?.trim().length).toBeGreaterThan(50);
  });
});
