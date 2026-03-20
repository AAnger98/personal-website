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
    await expect(page.getByText('3 of 5', { exact: true })).toBeVisible();
  });
});

test.describe('Strengths flow — pitch step', () => {
  async function goToPitch(page: Page) {
    await page.goto('/strengths');
    const chips = page.locator('.sw-grid .sw-chip');
    for (let i = 0; i < 5; i++) {
      await chips.nth(i).click();
    }
    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await page.getByRole('button', { name: /CONTINUE/i }).click();
  }

  test('pitch step shows #1 strength word prominently', async ({ page }) => {
    await goToPitch(page);
    await expect(page.locator('.spi-anchor-word')).toBeVisible();
  });

  test('pitch step has a textarea', async ({ page }) => {
    await goToPitch(page);
    await expect(page.locator('.spi-textarea')).toBeVisible();
  });

  test('character count is displayed', async ({ page }) => {
    await goToPitch(page);
    await page.locator('.spi-textarea').fill('Hello world');
    await expect(page.locator('.spi-char-count')).toContainText('11');
  });

  test('continue advances to step 4', async ({ page }) => {
    await goToPitch(page);
    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await expect(page.getByText('4 of 5', { exact: true })).toBeVisible();
  });
});

test.describe('Strengths flow — PDF step', () => {
  async function goToPdf(page: Page) {
    await page.goto('/strengths');
    const chips = page.locator('.sw-grid .sw-chip');
    for (let i = 0; i < 5; i++) {
      await chips.nth(i).click();
    }
    await page.getByRole('button', { name: /CONTINUE/i }).click(); // → reflection
    await page.getByRole('button', { name: /CONTINUE/i }).click(); // → pitch
    await page.getByRole('button', { name: /CONTINUE/i }).click(); // → pdf
  }

  test('PDF step shows download button', async ({ page }) => {
    await goToPdf(page);
    await expect(page.getByRole('button', { name: /DOWNLOAD/i })).toBeVisible();
  });

  test('PDF step shows print button', async ({ page }) => {
    await goToPdf(page);
    await expect(page.getByRole('button', { name: /PRINT/i })).toBeVisible();
  });

  test('PDF step shows the 5 selected words', async ({ page }) => {
    await goToPdf(page);
    await expect(page.locator('.spdf-words-list li')).toHaveCount(5);
  });

  test('continue advances to step 5', async ({ page }) => {
    await goToPdf(page);
    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await expect(page.getByText('5 of 5')).toBeVisible();
  });
});
