import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

// ─── Layout at each viewport ─────────────────────────────────────────────────

for (const vp of viewports) {
  test.describe(`${vp.name} (${vp.width}px)`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('home page loads without horizontal overflow', async ({ page }) => {
      await page.goto('/');
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(overflow).toBe(false);
    });

    test('header is visible', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('.site-header')).toBeVisible();
    });
  });
}

// ─── Mobile hamburger nav ─────────────────────────────────────────────────────

test.describe('mobile hamburger navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('nav toggle button is present', async ({ page }) => {
    await page.goto('/');
    // Expects a button with aria-label containing "navigation" or "menu"
    const toggle = page.locator('button[aria-label*="navigation" i], button[aria-label*="menu" i]');
    await expect(toggle).toBeVisible();
  });

  test('nav links are hidden by default on mobile', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('header nav');
    // Nav should not be visible before toggle is clicked
    await expect(nav).not.toBeVisible();
  });

  test('clicking toggle reveals nav links', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('button[aria-label*="navigation" i], button[aria-label*="menu" i]');
    await toggle.click();
    await expect(page.locator('header nav')).toBeVisible();
  });

  test('clicking toggle again hides nav links', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('button[aria-label*="navigation" i], button[aria-label*="menu" i]');
    await toggle.click();
    await expect(page.locator('header nav')).toBeVisible();
    await toggle.click();
    await expect(page.locator('header nav')).not.toBeVisible();
  });
});
