import { test, expect } from '@playwright/test';

const allPages = ['/', '/about', '/work'];

// ─── HTML lang attribute ─────────────────────────────────────────────────────

test.describe('HTML lang attribute', () => {
  for (const path of allPages) {
    test(`${path} has lang="en" on <html>`, async ({ page }) => {
      await page.goto(path);
      const lang = await page.evaluate(() => document.documentElement.lang);
      expect(lang).toBe('en');
    });
  }
});

// ─── Skip-to-content link ────────────────────────────────────────────────────

test.describe('Skip-to-content link', () => {
  test('skip link is present in the DOM', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.skip-to-content')).toBeAttached();
  });

  test('skip link points to #main-content', async ({ page }) => {
    await page.goto('/');
    const href = await page.locator('.skip-to-content').getAttribute('href');
    expect(href).toBe('#main-content');
  });

  test('#main-content target exists', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeAttached();
  });

  test('skip link can receive keyboard focus', async ({ page }) => {
    await page.goto('/');
    await page.locator('.skip-to-content').focus();
    await expect(page.locator('.skip-to-content')).toBeFocused();
  });
});

// ─── Heading hierarchy ───────────────────────────────────────────────────────

test.describe('Work page heading hierarchy', () => {
  test('work titles are rendered as h3 elements', async ({ page }) => {
    await page.goto('/work');
    const h3Count = await page.locator('.work-title').evaluateAll(
      (els) => els.filter((el) => el.tagName === 'H3').length
    );
    expect(h3Count).toBeGreaterThanOrEqual(1);
  });

  test('work list section has a visually-hidden h2', async ({ page }) => {
    await page.goto('/work');
    const h2 = page.locator('h2.visually-hidden');
    await expect(h2).toBeAttached();
  });
});
