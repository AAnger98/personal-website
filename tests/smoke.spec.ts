import { test, expect } from '@playwright/test';

test('home page returns 200 and has a non-empty <title>', async ({ page }) => {
  const response = await page.goto('/');

  // Page responds with HTTP 200
  expect(response?.status()).toBe(200);

  // Page has a <title> element with non-empty text
  const titleText = await page.title();
  expect(titleText.trim().length).toBeGreaterThan(0);
});

test('home page has a heading and a contact CTA link', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.page-title')).toBeVisible();
  await expect(page.locator('.cta-link')).toBeVisible();
});
