import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/work', label: 'Work' },
  { path: '/contact', label: 'Contact' },
];

// ─── Meta description ────────────────────────────────────────────────────────

test.describe('Meta description', () => {
  for (const { path, label } of pages) {
    test(`${label} page has a non-empty meta description`, async ({ page }) => {
      await page.goto(path);
      const content = await page
        .locator('meta[name="description"]')
        .getAttribute('content');
      expect(content).toBeTruthy();
      expect(content!.trim().length).toBeGreaterThan(0);
    });
  }
});

// ─── Open Graph tags ─────────────────────────────────────────────────────────

test.describe('Open Graph tags', () => {
  for (const { path, label } of pages) {
    test.describe(`${label} page`, () => {
      test('has og:title', async ({ page }) => {
        await page.goto(path);
        const content = await page
          .locator('meta[property="og:title"]')
          .getAttribute('content');
        expect(content).toBeTruthy();
      });

      test('has og:description', async ({ page }) => {
        await page.goto(path);
        const content = await page
          .locator('meta[property="og:description"]')
          .getAttribute('content');
        expect(content).toBeTruthy();
      });

      test('has og:url', async ({ page }) => {
        await page.goto(path);
        const content = await page
          .locator('meta[property="og:url"]')
          .getAttribute('content');
        expect(content).toBeTruthy();
        expect(content).toMatch(/^https?:\/\//);
      });

      test('has og:type set to "website"', async ({ page }) => {
        await page.goto(path);
        const content = await page
          .locator('meta[property="og:type"]')
          .getAttribute('content');
        expect(content).toBe('website');
      });
    });
  }
});

// ─── Canonical URL ───────────────────────────────────────────────────────────

test.describe('Canonical URL', () => {
  for (const { path, label } of pages) {
    test(`${label} page has a canonical link`, async ({ page }) => {
      await page.goto(path);
      const href = await page
        .locator('link[rel="canonical"]')
        .getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toMatch(/^https?:\/\//);
    });
  }
});

// ─── robots.txt ──────────────────────────────────────────────────────────────

test('robots.txt is accessible and contains User-agent directive', async ({ page }) => {
  const response = await page.goto('/robots.txt');
  expect(response?.status()).toBe(200);
  const bodyText = await page.locator('body').textContent();
  expect(bodyText).toContain('User-agent');
});

