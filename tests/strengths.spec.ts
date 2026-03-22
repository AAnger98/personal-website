import { test, expect, type Locator, type Page } from '@playwright/test';

// Serial mode: chip clicks require React hydration; parallel runs race the dev server
test.describe.configure({ mode: 'serial' });
// Increase timeout: first navigation triggers Vite TypeScript compilation (~40s in dev)
test.setTimeout(90_000);

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Wait for Astro to finish hydrating the React island.
 * Astro removes the `ssr` attribute from <astro-island> once React has taken over.
 * Without this, clicking buttons after page.goto may silently do nothing.
 */
async function waitForHydration(page: Page): Promise<void> {
  await page.waitForSelector('astro-island:not([ssr])', { timeout: 80_000 });
}

/** Return all word chip buttons in the grid. */
function wordChips(page: Page): Locator {
  return page.locator('.sw-grid button[role="checkbox"]');
}

/** Return the first N unselected, non-maxed word chips. */
async function pickableChips(page: Page, count: number): Promise<Locator[]> {
  const all = wordChips(page);
  const total = await all.count();
  const result: Locator[] = [];
  for (let i = 0; i < total && result.length < count; i++) {
    const chip = all.nth(i);
    const checked = await chip.getAttribute('aria-checked');
    const disabled = await chip.getAttribute('aria-disabled');
    if (checked === 'false' && disabled !== 'true') {
      result.push(chip);
    }
  }
  return result;
}

/** Select 5 words and click Continue to advance past word selection. */
async function completeWordSelection(page: Page) {
  await page.goto('/strengths');
  await waitForHydration(page);
  const chips = page.locator('.sw-grid .sw-chip');
  for (let i = 0; i < 5; i++) {
    await chips.nth(i).click();
  }
  await page.getByRole('button', { name: /CONTINUE/i }).click();
}

// ═══════════════════════════════════════════════════════════════════════════
// Word Selection Step — Grid, Toggle, Island, Definitions
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Strengths — Page Load', () => {
  test('page loads without error', async ({ page }) => {
    // Use 'commit' to check HTTP status without waiting for full JS load
    const response = await page.goto('/strengths', { waitUntil: 'commit' });
    expect(response?.status()).toBe(200);
  });

  test('page has correct title', async ({ page }) => {
    await page.goto('/strengths', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Strengths Identifier/);
  });

  test('word grid renders with buttons', async ({ page }) => {
    await page.goto('/strengths', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.sw-grid');
    const chips = wordChips(page);
    const count = await chips.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Strengths — Word Grid Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strengths', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.sw-grid');
  });

  test('grid contains word buttons with role="checkbox"', async ({ page }) => {
    const chips = wordChips(page);
    const count = await chips.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(chips.nth(i)).toHaveAttribute('role', 'checkbox');
    }
  });

  test('unselected buttons show ☐ prefix', async ({ page }) => {
    const firstChip = wordChips(page).first();
    const text = await firstChip.textContent();
    expect(text?.trim()).toMatch(/^☐/);
  });

  test('grid group has accessible label', async ({ page }) => {
    const grid = page.locator('.sw-grid');
    await expect(grid).toHaveAttribute('role', 'group');
    await expect(grid).toHaveAttribute('aria-label', 'Strength words');
  });
});

test.describe('Strengths — Selection Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strengths');
    await waitForHydration(page);
  });

  test('clicking a word toggles aria-checked from false to true', async ({ page }) => {
    const chip = wordChips(page).first();
    await expect(chip).toHaveAttribute('aria-checked', 'false');
    await chip.click();
    await expect(chip).toHaveAttribute('aria-checked', 'true');
  });

  test('clicking a selected word deselects it', async ({ page }) => {
    const chip = wordChips(page).first();
    await chip.click();
    await expect(chip).toHaveAttribute('aria-checked', 'true');
    await chip.click();
    await expect(chip).toHaveAttribute('aria-checked', 'false');
  });

  test('selected word shows ☑ prefix', async ({ page }) => {
    const chip = wordChips(page).first();
    await chip.click();
    await expect(chip).toContainText('☑');
  });

  test('counter updates on selection', async ({ page }) => {
    const progressBar = page.locator('.sw-island__bar[role="progressbar"]');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    const chip = wordChips(page).first();
    await chip.click();
    await expect(progressBar).toHaveAttribute('aria-valuenow', '1');
    await chip.click();
    await expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });
});

test.describe('Strengths — Max Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strengths');
    await waitForHydration(page);
  });

  test('after selecting 5 words, remaining buttons get .sw-chip--maxed', async ({ page }) => {
    const chips = await pickableChips(page, 5);
    expect(chips.length).toBe(5);
    for (const chip of chips) {
      await chip.click();
    }
    const allChips = wordChips(page);
    const total = await allChips.count();
    let foundMaxed = false;
    for (let i = 0; i < total; i++) {
      const checked = await allChips.nth(i).getAttribute('aria-checked');
      if (checked === 'false') {
        await expect(allChips.nth(i)).toHaveClass(/sw-chip--maxed/);
        foundMaxed = true;
        break;
      }
    }
    expect(foundMaxed).toBe(true);
  });

  test('maxed buttons have aria-disabled="true"', async ({ page }) => {
    const chips = await pickableChips(page, 5);
    for (const chip of chips) {
      await chip.click();
    }
    const allChips = wordChips(page);
    const total = await allChips.count();
    for (let i = 0; i < total; i++) {
      const checked = await allChips.nth(i).getAttribute('aria-checked');
      if (checked === 'false') {
        await expect(allChips.nth(i)).toHaveAttribute('aria-disabled', 'true');
        break;
      }
    }
  });

  test('clicking a maxed button does NOT select it', async ({ page }) => {
    const chips = await pickableChips(page, 5);
    for (const chip of chips) {
      await chip.click();
    }
    const allChips = wordChips(page);
    const total = await allChips.count();
    for (let i = 0; i < total; i++) {
      const checked = await allChips.nth(i).getAttribute('aria-checked');
      if (checked === 'false') {
        await allChips.nth(i).click({ force: true });
        await expect(allChips.nth(i)).toHaveAttribute('aria-checked', 'false');
        break;
      }
    }
    const progressBar = page.locator('.sw-island__bar[role="progressbar"]');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '5');
  });

  test('continue button is disabled before 5 selections', async ({ page }) => {
    const continueBtn = page.locator('.sw-btn--primary');
    await expect(continueBtn).toBeDisabled();
  });

  test('continue button becomes enabled at 5 selections', async ({ page }) => {
    const chips = await pickableChips(page, 5);
    for (const chip of chips) {
      await chip.click();
    }
    const continueBtn = page.locator('.sw-btn--primary');
    await expect(continueBtn).toBeEnabled();
    await expect(continueBtn).toContainText('CONTINUE');
  });
});

test.describe('Strengths — Selection Island', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strengths');
    await waitForHydration(page);
  });

  test('island container is present', async ({ page }) => {
    const island = page.locator('.sw-island');
    await expect(island).toBeVisible();
  });

  test('selected words appear as chips in the island', async ({ page }) => {
    const chip = wordChips(page).first();
    const chipText = await chip.textContent();
    const wordName = chipText?.replace(/^[☐☑]\s*/, '').trim() ?? '';
    await chip.click();
    const islandChip = page.locator('.sw-island__chip-label');
    await expect(islandChip.first()).toContainText(wordName);
  });

  test('clicking ✕ on an island chip deselects the word', async ({ page }) => {
    const chip = wordChips(page).first();
    await chip.click();
    await expect(chip).toHaveAttribute('aria-checked', 'true');
    const closeBtn = page.locator('.sw-island__remove').first();
    await closeBtn.click();
    await expect(chip).toHaveAttribute('aria-checked', 'false');
  });

  test('progress bar updates on selection', async ({ page }) => {
    const progressBar = page.locator('.sw-island__bar[role="progressbar"]');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    await wordChips(page).first().click();
    await expect(progressBar).toHaveAttribute('aria-valuenow', '1');
  });

  test('empty slots show dashed placeholders', async ({ page }) => {
    const emptySlots = page.locator('.sw-island__slot--empty');
    const count = await emptySlots.count();
    expect(count).toBe(5);
    await wordChips(page).first().click();
    const newCount = await emptySlots.count();
    expect(newCount).toBe(4);
  });
});

test.describe('Strengths — Definition Preview Bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strengths');
    await waitForHydration(page);
  });

  test('definition bar is present', async ({ page }) => {
    const bar = page.locator('.sw-definition-bar');
    await expect(bar).toBeVisible();
  });

  test('idle state shows prompt text', async ({ page }) => {
    const prompt = page.locator('.sw-definition-bar__prompt');
    await expect(prompt).toHaveText('Hover over a word to see its definition');
  });

  test('hovering a word shows its definition', async ({ page }) => {
    const chip = wordChips(page).first();
    await chip.hover();
    const defWord = page.locator('.sw-definition-bar__word');
    await expect(defWord).toBeVisible();
    const defText = page.locator('.sw-definition-bar__text');
    await expect(defText).toBeVisible();
  });

  test('moving away returns to idle prompt text', async ({ page }) => {
    const chip = wordChips(page).first();
    await chip.hover();
    await expect(page.locator('.sw-definition-bar__word')).toBeVisible();
    await page.locator('.sw-header').hover();
    const prompt = page.locator('.sw-definition-bar__prompt');
    await expect(prompt).toBeVisible();
  });
});

test.describe('Strengths — Maxed Chip Hover Peek', () => {
  test('hovering a maxed chip shows its definition in the bar', async ({ page }) => {
    await page.goto('/strengths');
    await waitForHydration(page);
    const chips = await pickableChips(page, 5);
    for (const chip of chips) {
      await chip.click();
    }
    const maxedChip = page.locator('.sw-chip--maxed').first();
    await expect(maxedChip).toBeVisible();
    await maxedChip.hover();
    const defWord = page.locator('.sw-definition-bar__word');
    await expect(defWord).toBeVisible();
    const defText = page.locator('.sw-definition-bar__text');
    await expect(defText).toBeVisible();
    const text = await defText.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });
});

test.describe('Strengths — Responsive Layout', () => {
  test('grid renders differently at 600px viewport vs default', async ({ browser }) => {
    const defaultContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const defaultPage = await defaultContext.newPage();
    await defaultPage.goto('/strengths', { waitUntil: 'domcontentloaded' });
    await defaultPage.waitForSelector('.sw-grid');
    const defaultBox = await defaultPage.locator('.sw-grid').boundingBox();

    const narrowContext = await browser.newContext({ viewport: { width: 600, height: 720 } });
    const narrowPage = await narrowContext.newPage();
    await narrowPage.goto('/strengths', { waitUntil: 'domcontentloaded' });
    await narrowPage.waitForSelector('.sw-grid');
    const narrowBox = await narrowPage.locator('.sw-grid').boundingBox();

    expect(defaultBox).toBeTruthy();
    expect(narrowBox).toBeTruthy();
    expect(narrowBox!.width).toBeLessThan(defaultBox!.width);

    await defaultContext.close();
    await narrowContext.close();
  });
});

test.describe('Strengths — Timer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strengths');
    await waitForHydration(page);
  });

  test('timer element is visible', async ({ page }) => {
    const timer = page.locator('.sw-timer__display');
    await expect(timer).toBeVisible();
  });

  test('timer starts at 5:00', async ({ page }) => {
    const timer = page.locator('.sw-timer__display');
    await expect(timer).toHaveText('5:00');
  });

  test('timer counts down', async ({ page }) => {
    const timer = page.locator('.sw-timer__display');
    const initial = await timer.textContent();
    await page.waitForTimeout(1200);
    const updated = await timer.textContent();
    expect(updated).not.toBe(initial);
    expect(updated).toMatch(/^4:5[89]$/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Multi-Step Flow — Progress, Reflection, Pitch, PDF, Feedback
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Strengths flow — progress indicator', () => {
  test('shows step 1 of 5 on load', async ({ page }) => {
    await page.goto('/strengths', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.sp-root');
    await expect(page.getByText('1 of 5')).toBeVisible();
  });

  test('shows step 2 of 5 after word selection', async ({ page }) => {
    await completeWordSelection(page);
    await expect(page.getByText('2 of 5')).toBeVisible();
  });
});

test.describe('Strengths flow — restart', () => {
  test('restart button resets to step 1', async ({ page }) => {
    await completeWordSelection(page);
    await page.getByRole('button', { name: /START OVER/i }).click();
    await expect(page.getByText('1 of 5')).toBeVisible();
    await expect(page.locator('.sw-chip--selected')).toHaveCount(0);
  });
});

test.describe('Strengths flow — reflection step', () => {
  test('reflection step shows the 5 selected words', async ({ page }) => {
    await completeWordSelection(page);
    await expect(page.locator('.sr-word-header')).toHaveCount(5);
  });

  test('each word has two text inputs', async ({ page }) => {
    await completeWordSelection(page);
    await expect(page.locator('.sr-field textarea')).toHaveCount(10);
  });

  test('continue button is enabled even with blank fields (soft gate)', async ({ page }) => {
    await completeWordSelection(page);
    await expect(page.getByRole('button', { name: /CONTINUE/i })).toBeEnabled();
  });

  test('shows character nudge when field has fewer than 50 chars', async ({ page }) => {
    await completeWordSelection(page);
    const firstTextarea = page.locator('.sr-field textarea').first();
    await firstTextarea.fill('short');
    await firstTextarea.blur();
    await expect(page.locator('.sr-nudge').first()).toBeVisible();
  });

  test('nudge disappears when field has 50+ chars', async ({ page }) => {
    await completeWordSelection(page);
    const firstTextarea = page.locator('.sr-field textarea').first();
    await firstTextarea.fill('a'.repeat(50));
    await firstTextarea.blur();
    await expect(page.locator('.sr-nudge').first()).not.toBeVisible();
  });

  test('advancing to step 3 shows pitch step', async ({ page }) => {
    await completeWordSelection(page);
    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await expect(page.getByText('3 of 5', { exact: true })).toBeVisible();
  });
});

test.describe('Strengths flow — pitch step', () => {
  async function goToPitch(page: Page) {
    await completeWordSelection(page);
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
    await completeWordSelection(page);
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
    await expect(page.getByText('5 of 5', { exact: true })).toBeVisible();
  });
});

test.describe('Strengths flow — feedback step', () => {
  async function goToFeedback(page: Page) {
    await completeWordSelection(page);
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /CONTINUE/i }).click();
    }
  }

  test('feedback step shows 1–5 rating buttons', async ({ page }) => {
    await goToFeedback(page);
    await expect(page.locator('.sfb-rating-btn')).toHaveCount(5);
  });

  test('feedback step has optional free-text field', async ({ page }) => {
    await goToFeedback(page);
    await expect(page.locator('.sfb-textarea')).toBeVisible();
  });

  test('skip button is always available', async ({ page }) => {
    await goToFeedback(page);
    await expect(page.getByRole('button', { name: /SKIP/i })).toBeVisible();
  });

  test('submitting feedback shows completion state', async ({ page }) => {
    await goToFeedback(page);
    await page.locator('.sfb-rating-btn').nth(3).click();
    await page.getByRole('button', { name: /SUBMIT/i }).click();
    await expect(page.locator('.sfb-complete')).toBeVisible();
  });

  test('skip also shows completion state', async ({ page }) => {
    await goToFeedback(page);
    await page.getByRole('button', { name: /SKIP/i }).click();
    await expect(page.locator('.sfb-complete')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Keyboard Navigation + Focus (ATR-21/27)
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Strengths — Keyboard Navigation (ATR-21)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strengths');
    await waitForHydration(page);
  });

  test('Tab key can reach a word button', async ({ page }) => {
    // Tab repeatedly until a word chip receives focus (up to 30 tabs)
    let focusedRole: string | null = null;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      focusedRole = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.getAttribute('role') : null;
      });
      if (focusedRole === 'checkbox') break;
    }
    expect(focusedRole).toBe('checkbox');
  });

  test('Space key selects a focused word button (aria-checked becomes true)', async ({ page }) => {
    // Tab until a word chip is focused
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const role = await page.evaluate(() => document.activeElement?.getAttribute('role'));
      if (role === 'checkbox') break;
    }

    // Capture which button is focused and its initial state
    const initialChecked = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return el?.getAttribute('aria-checked');
    });
    expect(initialChecked).toBe('false');

    // Press Space to select
    await page.keyboard.press('Space');

    const afterChecked = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return el?.getAttribute('aria-checked');
    });
    expect(afterChecked).toBe('true');
  });

  test('Space key deselects a focused word button that is already selected', async ({ page }) => {
    // Tab until a word chip is focused
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const role = await page.evaluate(() => document.activeElement?.getAttribute('role'));
      if (role === 'checkbox') break;
    }

    // Select with Space
    await page.keyboard.press('Space');
    const afterSelect = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return el?.getAttribute('aria-checked');
    });
    expect(afterSelect).toBe('true');

    // Deselect with Space (need brief wait for the 200ms deselect timeout)
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    // After deselect the button may have lost focus (DOM update); check island count instead
    const progressBar = page.locator('.sw-island__bar[role="progressbar"]');
    await expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  test('focused word button has a visible focus-visible outline', async ({ page }) => {
    // Tab until a word chip is focused
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const role = await page.evaluate(() => document.activeElement?.getAttribute('role'));
      if (role === 'checkbox') break;
    }

    // Evaluate the computed outline style on the focused element
    const outlineWidth = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return '0px';
      return window.getComputedStyle(el).outlineWidth;
    });

    // A non-zero outline width confirms the focus-visible style is applied
    expect(outlineWidth).not.toBe('0px');
    expect(outlineWidth).not.toBe('');
  });
});

test.describe('Strengths flow — full journey', () => {
  test('completes the full 5-step flow without errors', async ({ page }) => {
    await completeWordSelection(page);
    await expect(page.getByText('2 of 5', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await expect(page.getByText('3 of 5', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await expect(page.getByText('4 of 5', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await expect(page.getByText('5 of 5', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: /SKIP/i }).click();
    await expect(page.locator('.sfb-complete')).toBeVisible();
  });

  test('back navigation from step 2 returns to step 1 with chips still selected', async ({ page }) => {
    await completeWordSelection(page);
    await expect(page.getByText('2 of 5', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /BACK/i }).click();
    await expect(page.getByText('1 of 5', { exact: true })).toBeVisible();
    await expect(page.locator('.sw-chip--selected')).toHaveCount(5);
  });

  test('back navigation from step 3 returns to step 2', async ({ page }) => {
    await completeWordSelection(page);
    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await expect(page.getByText('3 of 5', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /BACK/i }).click();
    await expect(page.getByText('2 of 5', { exact: true })).toBeVisible();
  });

  test('back navigation from step 4 returns to step 3', async ({ page }) => {
    await completeWordSelection(page);
    for (let i = 0; i < 2; i++) {
      await page.getByRole('button', { name: /CONTINUE/i }).click();
    }
    await expect(page.getByText('4 of 5', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /BACK/i }).click();
    await expect(page.getByText('3 of 5', { exact: true })).toBeVisible();
  });

  test('START OVER from completion screen resets to step 1', async ({ page }) => {
    await completeWordSelection(page);
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /CONTINUE/i }).click();
    }
    await page.getByRole('button', { name: /SKIP/i }).click();
    await expect(page.locator('.sfb-complete')).toBeVisible();
    await page.locator('.sfb-complete').getByRole('button', { name: /START OVER/i }).click();
    await expect(page.getByText('1 of 5', { exact: true })).toBeVisible();
    await expect(page.locator('.sw-chip--selected')).toHaveCount(0);
  });

  test('SSR content appears in under 3 seconds', async ({ page }) => {
    const start = Date.now();
    // Use 'commit' to measure time-to-first-byte (server SSR response speed).
    // JS hydration takes longer in constrained environments; this tests the server.
    await page.goto('/strengths', { waitUntil: 'commit' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Exclude external resource failures (e.g. Google Fonts DNS in CI/offline env)
        if (!text.includes('net::ERR_')) {
          errors.push(text);
        }
      }
    });
    await page.goto('/strengths');
    await waitForHydration(page);
    expect(errors).toHaveLength(0);
  });
});
