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

// ─── Contact page ─────────────────────────────────────────────────────────────

test.describe('Contact page', () => {
  test('loads without error and has a heading', async ({ page }) => {
    const response = await page.goto('/contact');
    expect(response?.status()).toBe(200);
    await expect(page.locator('.page-title')).toBeVisible();
  });

  test('has a visible contact link', async ({ page }) => {
    await page.goto('/contact');
    const contactLink = page.locator('a[href^="mailto:"]');
    await expect(contactLink).toBeVisible();
    const href = await contactLink.getAttribute('href');
    expect(href).toMatch(/^mailto:.+@.+\..+/);
  });
});
