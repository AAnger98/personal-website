import { test, expect, type Locator } from '@playwright/test';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Return all word chip buttons in the grid. */
function wordChips(page: import('@playwright/test').Page): Locator {
  return page.locator('.sw-grid button[role="checkbox"]');
}

/** Return the first N unselected, non-maxed word chips. */
async function pickableChips(
  page: import('@playwright/test').Page,
  count: number,
): Promise<Locator[]> {
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

// ─── Page Load ──────────────────────────────────────────────────────────────

test.describe('Strengths Identifier — Page Load', () => {
  test('page loads without error', async ({ page }) => {
    const response = await page.goto('/strengths');
    expect(response?.status()).toBe(200);
  });

  test('page has correct title', async ({ page }) => {
    await page.goto('/strengths');
    await expect(page).toHaveTitle(/Strengths Identifier/);
  });

  test('word grid renders with buttons', async ({ page }) => {
    await page.goto('/strengths');
    await page.waitForSelector('.sw-grid');
    const chips = wordChips(page);
    const count = await chips.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ─── Word Grid Layout ───────────────────────────────────────────────────────

test.describe('Strengths Identifier — Word Grid Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strengths');
    await page.waitForSelector('.sw-grid');
  });

  test('grid contains word buttons with role="checkbox"', async ({ page }) => {
    const chips = wordChips(page);
    const count = await chips.count();
    expect(count).toBeGreaterThan(0);

    // Verify every button in the grid has role="checkbox"
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

// ─── Selection Behavior ─────────────────────────────────────────────────────

test.describe('Strengths Identifier — Selection Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strengths');
    await page.waitForSelector('.sw-grid');
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
    const text = await chip.textContent();
    expect(text?.trim()).toMatch(/^☑/);
  });

  test('counter updates on selection', async ({ page }) => {
    const counter = page.locator('.sw-counter__num');
    await expect(counter).toHaveText('0');

    const chip = wordChips(page).first();
    await chip.click();
    await expect(counter).toHaveText('1');

    await chip.click();
    await expect(counter).toHaveText('0');
  });
});

// ─── Max Selection (5 words) ────────────────────────────────────────────────

test.describe('Strengths Identifier — Max Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strengths');
    await page.waitForSelector('.sw-grid');
  });

  test('after selecting 5 words, remaining buttons get .sw-chip--maxed', async ({ page }) => {
    const chips = await pickableChips(page, 5);
    expect(chips.length).toBe(5);

    for (const chip of chips) {
      await chip.click();
    }

    // Find an unselected chip — it should now have the maxed class
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

    // Find a maxed (unselected) chip and click it
    const allChips = wordChips(page);
    const total = await allChips.count();
    for (let i = 0; i < total; i++) {
      const checked = await allChips.nth(i).getAttribute('aria-checked');
      if (checked === 'false') {
        await allChips.nth(i).click({ force: true });
        // Still should be unchecked
        await expect(allChips.nth(i)).toHaveAttribute('aria-checked', 'false');
        break;
      }
    }

    // Counter should still show 5
    const counter = page.locator('.sw-counter__num');
    await expect(counter).toHaveText('5');
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

// ─── Selection Island ───────────────────────────────────────────────────────

test.describe('Strengths Identifier — Selection Island', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strengths');
    await page.waitForSelector('.sw-grid');
  });

  test('island container is present', async ({ page }) => {
    const island = page.locator('.sw-island');
    await expect(island).toBeVisible();
  });

  test('selected words appear as chips in the island', async ({ page }) => {
    const chip = wordChips(page).first();
    const chipText = await chip.textContent();
    // Extract word name (strip the ☐ prefix)
    const wordName = chipText?.replace(/^[☐☑]\s*/, '').trim() ?? '';

    await chip.click();

    const islandChip = page.locator('.sw-island__chip-label');
    await expect(islandChip.first()).toContainText(wordName);
  });

  test('clicking ✕ on an island chip deselects the word', async ({ page }) => {
    const chip = wordChips(page).first();
    await chip.click();
    await expect(chip).toHaveAttribute('aria-checked', 'true');

    // Click the close button in the island
    const closeBtn = page.locator('.sw-island__chip-close').first();
    await closeBtn.click();

    // The grid chip should now be deselected
    await expect(chip).toHaveAttribute('aria-checked', 'false');
  });

  test('progress bar updates on selection', async ({ page }) => {
    const progressBar = page.locator('.sw-island__progress-bar');
    const initialValue = await progressBar.getAttribute('aria-valuenow');
    expect(initialValue).toBe('0');

    await wordChips(page).first().click();

    const updatedValue = await progressBar.getAttribute('aria-valuenow');
    expect(updatedValue).toBe('1');
  });

  test('empty slots show dashed placeholders', async ({ page }) => {
    // Before any selection, all 5 slots should be empty
    const emptySlots = page.locator('.sw-island__empty-slot');
    const count = await emptySlots.count();
    expect(count).toBe(5);

    // Select one word — should reduce empty slots to 4
    await wordChips(page).first().click();
    const newCount = await emptySlots.count();
    expect(newCount).toBe(4);
  });

  test('island has aria-live for accessibility', async ({ page }) => {
    const island = page.locator('.sw-island');
    await expect(island).toHaveAttribute('aria-live', 'polite');
  });
});

// ─── Definition Preview Bar ─────────────────────────────────────────────────

test.describe('Strengths Identifier — Definition Preview Bar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strengths');
    await page.waitForSelector('.sw-grid');
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

    // Verify definition is shown
    await expect(page.locator('.sw-definition-bar__word')).toBeVisible();

    // Move mouse away from the grid entirely
    await page.locator('.sw-header').hover();

    // Should return to idle prompt
    const prompt = page.locator('.sw-definition-bar__prompt');
    await expect(prompt).toBeVisible();
  });
});

// ─── Timer ──────────────────────────────────────────────────────────────────

test.describe('Strengths Identifier — Timer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strengths');
    await page.waitForSelector('.sw-grid');
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

    // Wait just over 1 second for the timer to tick
    await page.waitForTimeout(1200);

    const updated = await timer.textContent();
    expect(updated).not.toBe(initial);
    // Should be 4:59 or 4:58 depending on timing
    expect(updated).toMatch(/^4:5[89]$/);
  });
});

// ─── Continue / Flow Transition ─────────────────────────────────────────────

test.describe('Strengths Identifier — Continue Action', () => {
  test('clicking continue with 5 selections advances to step 2', async ({ page }) => {
    await page.goto('/strengths');
    await page.waitForSelector('.sw-grid');

    const chips = await pickableChips(page, 5);
    for (const chip of chips) {
      await chip.click();
    }

    const continueBtn = page.locator('.sw-btn--primary');
    await continueBtn.click();

    // Should now show step 2 placeholder
    const stepLabel = page.locator('.sw-label');
    await expect(stepLabel).toHaveText('STEP 2 OF 5');
  });
});
