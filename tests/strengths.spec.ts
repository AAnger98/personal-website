import { test, expect, type Locator, type Page } from '@playwright/test';

// Serial mode: chip clicks require React hydration; parallel runs race the dev server
test.describe.configure({ mode: 'serial' });

// ─── Helpers ────────────────────────────────────────────────────────────────

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
  await page.waitForSelector('.sw-grid');
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

test.describe('Strengths — Word Grid Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strengths');
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

test.describe('Strengths — Max Selection', () => {
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

test.describe('Strengths — Selection Island', () => {
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
    const wordName = chipText?.replace(/^[☐☑]\s*/, '').trim() ?? '';
    await chip.click();
    const islandChip = page.locator('.sw-island__chip-label');
    await expect(islandChip.first()).toContainText(wordName);
  });

  test('clicking ✕ on an island chip deselects the word', async ({ page }) => {
    const chip = wordChips(page).first();
    await chip.click();
    await expect(chip).toHaveAttribute('aria-checked', 'true');
    const closeBtn = page.locator('.sw-island__chip-close').first();
    await closeBtn.click();
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
    const emptySlots = page.locator('.sw-island__empty-slot');
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
    await expect(page.locator('.sw-definition-bar__word')).toBeVisible();
    await page.locator('.sw-header').hover();
    const prompt = page.locator('.sw-definition-bar__prompt');
    await expect(prompt).toBeVisible();
  });
});

test.describe('Strengths — Maxed Chip Hover Peek', () => {
  test('hovering a maxed chip shows its definition in the bar', async ({ page }) => {
    await page.goto('/strengths');
    await page.waitForSelector('.sw-grid');
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
    await defaultPage.goto('/strengths');
    await defaultPage.waitForSelector('.sw-grid');
    const defaultBox = await defaultPage.locator('.sw-grid').boundingBox();

    const narrowContext = await browser.newContext({ viewport: { width: 600, height: 720 } });
    const narrowPage = await narrowContext.newPage();
    await narrowPage.goto('/strengths');
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
    await page.goto('/strengths');
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

  test('page loads in under 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/strengths');
    await page.locator('.sw-grid').waitFor();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });

  test('no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/strengths');
    await page.locator('.sw-grid').waitFor();
    expect(errors).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Mobile Responsiveness — Word Selection Step (ATR-19)
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Strengths — Mobile (375px iPhone SE)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/strengths');
    await page.waitForSelector('.sw-grid');
  });

  test('grid shows 2 columns at 375px width', async ({ page }) => {
    const grid = page.locator('.sw-grid');
    const gridColumns = await grid.evaluate(
      (el) => window.getComputedStyle(el).gridTemplateColumns
    );
    // repeat(2, 1fr) resolves to two equal pixel values, e.g. "150px 150px"
    const columnValues = gridColumns.trim().split(/\s+/);
    expect(columnValues).toHaveLength(2);
  });

  test('word chips are clickable and toggle correctly at 375px', async ({ page }) => {
    const chip = wordChips(page).first();

    // Verify initial state
    await expect(chip).toHaveAttribute('aria-checked', 'false');
    const textBefore = await chip.textContent();
    expect(textBefore?.trim()).toMatch(/^☐/);

    // Click to select
    await chip.click();
    await expect(chip).toHaveAttribute('aria-checked', 'true');
    const textAfter = await chip.textContent();
    expect(textAfter?.trim()).toMatch(/^☑/);

    // Click to deselect
    await chip.click();
    await expect(chip).toHaveAttribute('aria-checked', 'false');
  });

  test('sticky selection island is visible and functional at 375px', async ({ page }) => {
    // Island should be visible
    const island = page.locator('.sw-island');
    await expect(island).toBeVisible();

    // Select a word and verify it appears in the island
    const chip = wordChips(page).first();
    const chipText = await chip.textContent();
    const wordName = chipText?.replace(/^[☐☑]\s*/, '').trim() ?? '';
    await chip.click();

    const islandChipLabel = page.locator('.sw-island__chip-label');
    await expect(islandChipLabel.first()).toContainText(wordName);

    // Counter should update
    const counter = page.locator('.sw-counter__num');
    await expect(counter).toHaveText('1');

    // Remove via island close button
    const closeBtn = page.locator('.sw-island__chip-close').first();
    await closeBtn.click();
    await expect(chip).toHaveAttribute('aria-checked', 'false');
    await expect(counter).toHaveText('0');
  });
});

test.describe('Strengths — Tablet (768px)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test('grid shows 3 columns at 768px width', async ({ page }) => {
    await page.goto('/strengths');
    await page.waitForSelector('.sw-grid');

    const grid = page.locator('.sw-grid');
    const gridColumns = await grid.evaluate(
      (el) => window.getComputedStyle(el).gridTemplateColumns
    );
    // repeat(3, 1fr) resolves to three equal pixel values
    const columnValues = gridColumns.trim().split(/\s+/);
    expect(columnValues).toHaveLength(3);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Word Reordering — Move-up / Move-down buttons (ATR-18)
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Strengths — Word Reordering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/strengths');
    await page.waitForSelector('.sw-grid');
  });

  test('island chips have move-up and move-down buttons', async ({ page }) => {
    // Select 3 words
    const chips = page.locator('.sw-grid .sw-chip');
    for (let i = 0; i < 3; i++) {
      await chips.nth(i).click();
    }

    const moveUp = page.locator('.sw-island__chip-move-up');
    const moveDown = page.locator('.sw-island__chip-move-down');

    await expect(moveUp).toHaveCount(3);
    await expect(moveDown).toHaveCount(3);

    // First chip: move-up should be disabled
    await expect(moveUp.first()).toBeDisabled();
    // Last chip: move-down should be disabled
    await expect(moveDown.last()).toBeDisabled();
  });

  test('clicking move-down swaps chip with next chip', async ({ page }) => {
    const chips = page.locator('.sw-grid .sw-chip');
    for (let i = 0; i < 3; i++) {
      await chips.nth(i).click();
    }

    // Get initial order
    const labels = page.locator('.sw-island__chip-label');
    const initialFirst = await labels.nth(0).textContent();
    const initialSecond = await labels.nth(1).textContent();

    // Click move-down on the first chip
    const moveDown = page.locator('.sw-island__chip-move-down');
    await moveDown.first().click();

    // After swap, first should now be what was second, and second should be what was first
    const newFirst = await labels.nth(0).textContent();
    const newSecond = await labels.nth(1).textContent();
    expect(newFirst).toBe(initialSecond);
    expect(newSecond).toBe(initialFirst);
  });

  test('clicking move-up swaps chip with previous chip', async ({ page }) => {
    const chips = page.locator('.sw-grid .sw-chip');
    for (let i = 0; i < 3; i++) {
      await chips.nth(i).click();
    }

    // Get initial order
    const labels = page.locator('.sw-island__chip-label');
    const initialFirst = await labels.nth(0).textContent();
    const initialSecond = await labels.nth(1).textContent();

    // Click move-up on the second chip
    const moveUp = page.locator('.sw-island__chip-move-up');
    await moveUp.nth(1).click();

    // Second chip should now be first
    const newFirst = await labels.nth(0).textContent();
    const newSecond = await labels.nth(1).textContent();
    expect(newFirst).toBe(initialSecond);
    expect(newSecond).toBe(initialFirst);
  });

  test('reordered words persist through to reflection step', async ({ page }) => {
    // Select 5 words
    const chips = page.locator('.sw-grid .sw-chip');
    for (let i = 0; i < 5; i++) {
      await chips.nth(i).click();
    }

    // Get initial first two labels
    const labels = page.locator('.sw-island__chip-label');
    const originalFirst = (await labels.nth(0).textContent())?.replace(/[☑☐]\s*/, '').trim();
    const originalSecond = (await labels.nth(1).textContent())?.replace(/[☑☐]\s*/, '').trim();

    // Swap first two via move-down on first
    const moveDown = page.locator('.sw-island__chip-move-down');
    await moveDown.first().click();

    // Click CONTINUE to go to reflection step
    await page.getByRole('button', { name: /CONTINUE/i }).click();

    // Check reflection step headers show new order
    const reflectionHeaders = page.locator('.sr-word-header');
    const firstHeader = await reflectionHeaders.nth(0).textContent();
    const secondHeader = await reflectionHeaders.nth(1).textContent();

    // After swap: originalSecond should be first, originalFirst should be second
    expect(firstHeader).toContain(originalSecond);
    expect(secondHeader).toContain(originalFirst);
  });

  test('reorder buttons work on mobile viewport', async ({ page, browser }) => {
    const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('/strengths');
    await mobilePage.waitForSelector('.sw-grid');

    // Select 2 words
    const chips = mobilePage.locator('.sw-grid .sw-chip');
    await chips.nth(0).click();
    await chips.nth(1).click();

    // Verify move-down is visible
    const moveDown = mobilePage.locator('.sw-island__chip-move-down');
    await expect(moveDown.first()).toBeVisible();

    // Get initial order
    const labels = mobilePage.locator('.sw-island__chip-label');
    const initialFirst = await labels.nth(0).textContent();
    const initialSecond = await labels.nth(1).textContent();

    // Click move-down on first
    await moveDown.first().click();

    // Verify swap worked
    const newFirst = await labels.nth(0).textContent();
    const newSecond = await labels.nth(1).textContent();
    expect(newFirst).toBe(initialSecond);
    expect(newSecond).toBe(initialFirst);

    await mobileContext.close();
  });
});
