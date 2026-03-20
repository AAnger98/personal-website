import { test, expect, type Page } from '@playwright/test';

// Serial mode: chip clicks require React hydration; parallel runs race the dev server
test.describe.configure({ mode: 'serial' });

test.describe('Strengths flow — progress indicator', () => {
  test('shows step 1 of 5 on load', async ({ page }) => {
    await page.goto('/strengths');
    await expect(page.getByText('1 of 5')).toBeVisible();
  });

  test('shows step 2 of 5 after word selection', async ({ page }) => {
    await page.goto('/strengths');
    const chips = page.locator('.sw-grid .sw-chip');
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
    const chips = page.locator('.sw-grid .sw-chip');
    for (let i = 0; i < 5; i++) {
      await chips.nth(i).click();
    }
    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await page.getByRole('button', { name: /START OVER/i }).click();
    await expect(page.getByText('1 of 5')).toBeVisible();
    await expect(page.locator('.sw-chip--selected')).toHaveCount(0);
  });
});

test.describe('Strengths flow — reflection step', () => {
  async function goToReflection(page: Page) {
    await page.goto('/strengths');
    const chips = page.locator('.sw-grid .sw-chip');
    for (let i = 0; i < 5; i++) {
      await chips.nth(i).click();
    }
    await page.getByRole('button', { name: /CONTINUE/i }).click();
  }

  test('reflection step shows the 5 selected words', async ({ page }) => {
    await goToReflection(page);
    await expect(page.locator('.sr-word-header')).toHaveCount(5);
  });

  test('each word has two text inputs', async ({ page }) => {
    await goToReflection(page);
    await expect(page.locator('.sr-field textarea')).toHaveCount(10);
  });

  test('continue button is enabled even with blank fields (soft gate)', async ({ page }) => {
    await goToReflection(page);
    await expect(page.getByRole('button', { name: /CONTINUE/i })).toBeEnabled();
  });

  test('shows character nudge when field has fewer than 50 chars', async ({ page }) => {
    await goToReflection(page);
    const firstTextarea = page.locator('.sr-field textarea').first();
    await firstTextarea.fill('short');
    await firstTextarea.blur();
    await expect(page.locator('.sr-nudge').first()).toBeVisible();
  });

  test('nudge disappears when field has 50+ chars', async ({ page }) => {
    await goToReflection(page);
    const firstTextarea = page.locator('.sr-field textarea').first();
    await firstTextarea.fill('a'.repeat(50));
    await firstTextarea.blur();
    await expect(page.locator('.sr-nudge').first()).not.toBeVisible();
  });

  test('advancing to step 3 shows pitch step', async ({ page }) => {
    await goToReflection(page);
    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await expect(page.getByText('3 of 5')).toBeVisible();
  });
});
