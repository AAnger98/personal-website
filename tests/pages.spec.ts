import { test, expect } from '@playwright/test';

// ─── About page ──────────────────────────────────────────────────────────────


test.describe('About page', () => {
  test('loads without error and has a heading', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.status()).toBe(200);
    await expect(page.locator('.page-title')).toBeVisible();
  });

  test('has body content (not an empty page)', async ({ page }) => {
    await page.goto('/about');
    const mainText = await page.locator('main').textContent();
    expect(mainText?.trim().length).toBeGreaterThan(50);
  });
});

// ─── Work page ───────────────────────────────────────────────────────────────

test.describe('Work page', () => {
  test('loads without error and has a heading', async ({ page }) => {
    const response = await page.goto('/work');
    expect(response?.status()).toBe(200);
    await expect(page.locator('.page-title')).toBeVisible();
  });

  test('has at least one work entry', async ({ page }) => {
    await page.goto('/work');
    const count = await page.locator('.work-entry').count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
