import { test, expect } from '@playwright/test';

// Serial mode: chip clicks require React hydration; parallel runs race the dev server
test.describe.configure({ mode: 'serial' });

test.describe('Strengths flow — progress indicator', () => {
  test('shows step 1 of 5 on load', async ({ page }) => {
    await page.goto('/strengths');
    await expect(page.getByText('1 of 5')).toBeVisible();
  });

  test('shows step 2 of 5 after word selection', async ({ page }) => {
    await page.goto('/strengths');
    const chips = page.locator('.sw-chip');
    for (let i = 0; i < 5; i++) {
      await chips.nth(i).click();
    }
    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await expect(page.getByText('2 of 5')).toBeVisible();
  });
});

test.describe('Strengths flow — restart', () => {
  test('restart button resets to step 1', async ({ page }) => {
    await page.goto('/strengths');
    const chips = page.locator('.sw-chip');
    for (let i = 0; i < 5; i++) {
      await chips.nth(i).click();
    }
    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await page.getByRole('button', { name: /START OVER/i }).click();
    await expect(page.getByText('1 of 5')).toBeVisible();
    await expect(page.locator('.sw-chip--selected')).toHaveCount(0);
  });
});
