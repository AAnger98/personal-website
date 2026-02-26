import { test, expect } from '@playwright/test';
import { siteConfig } from '../src/config';

// ─── Header ──────────────────────────────────────────────────────────────────

test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('header element is visible', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
  });

  test('site name is visible in the header', async ({ page }) => {
    await expect(page.locator('header')).toContainText(siteConfig.name);
  });

  test('all nav links are present with correct hrefs', async ({ page }) => {
    for (const link of siteConfig.nav) {
      const navLink = page.locator(`header nav a[href="${link.href}"]`);
      await expect(navLink).toHaveCount(1);
      await expect(navLink).toContainText(link.label);
    }
  });
});

// ─── Footer ──────────────────────────────────────────────────────────────────

test.describe('Footer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('footer element is visible', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible();
  });

  test('site name is visible in the footer', async ({ page }) => {
    await expect(page.locator('footer')).toContainText(siteConfig.name);
  });

  test('current year is visible in the footer', async ({ page }) => {
    const year = String(new Date().getFullYear());
    await expect(page.locator('footer')).toContainText(year);
  });

  test('footer contains no empty or placeholder hrefs', async ({ page }) => {
    const links = page.locator('footer a');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
    }
  });
});
