# Strengths Page Polish Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bundle five small CSS/test improvements into a single polish pass on the strengths page — enlarge word buttons, fix theme consistency, improve accessibility, and clean up a test.

**Architecture:** All changes are CSS-only except the test refactor. The strengths page has its own theme (`strengths-theme.css`) scoped under `.strengths-page`, separate from the main Terminal Deco theme (`global.css`). Base styles live in `strengths.css`. Tests use Playwright E2E.

**Tech Stack:** Astro, React 18 (islands), TypeScript strict, vanilla CSS, Playwright

**Spec:** `docs/superpowers/specs/2026-03-24-strengths-polish-pass-design.md`

**Branch:** `feature/strengths-polish`

**Linear issues:** ATR-43, ATR-39, ATR-40, ATR-41, ATR-42

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/styles/strengths-theme.css` | Modify | Button sizing (ATR-43), focus-visible theme override (ATR-41), reorder button theme colors |
| `src/styles/strengths.css` | Modify | Border-radius fix (ATR-39), touch targets (ATR-40), focus-visible base rule (ATR-41) |
| `tests/strengths.spec.ts` | Modify | Mobile reorder test refactor (ATR-42) |

---

## Task 1: Enlarge word buttons — ATR-43

**Files:**
- Modify: `src/styles/strengths-theme.css:195-205`

- [ ] **Step 1: Run existing tests to establish baseline**

Run: `npx playwright test tests/strengths.spec.ts --reporter=line`
Expected: All 127 tests PASS (confirms nothing is broken before changes)

- [ ] **Step 2: Update button sizing in strengths-theme.css**

In `src/styles/strengths-theme.css`, change the `.strengths-page .sw-chip` rule (around line 195):

```css
.strengths-page .sw-chip {
  font-family: var(--st-font);
  font-size: 1.3rem;
  color: var(--st-text);
  background: var(--st-surface);
  border: 1px solid var(--st-border);
  border-radius: var(--st-radius);
  padding: 1.4rem 1.5rem;
  min-height: 74px;
  transition: all var(--st-transition);
}
```

Changes from current: `font-size` 1.15rem → 1.3rem, `padding` top 1rem → 1.4rem, `min-height` 56px → 74px.

- [ ] **Step 3: Add mobile breakpoint for smaller padding on small screens**

At the end of `src/styles/strengths-theme.css`, add a new media query (no such breakpoint currently exists in this file):

```css
/* ── Responsive — small viewport chip padding ────────────────────────────── */

@media (max-width: 480px) {
  .strengths-page .sw-chip {
    padding: 1.2rem 1rem;
  }
}
```

- [ ] **Step 4: Run tests to verify nothing broke**

Run: `npx playwright test tests/strengths.spec.ts --reporter=line`
Expected: All tests PASS

- [ ] **Step 5: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/styles/strengths-theme.css
git commit -m "feat: enlarge word buttons on strengths page (ATR-43)

font-size 1.15rem → 1.3rem, padding 1rem → 1.4rem, min-height 56px → 74px.
Add 480px breakpoint for mobile padding."
```

---

## Task 2: Replace hardcoded border-radius — ATR-39

**Files:**
- Modify: `src/styles/strengths.css:615`

- [ ] **Step 1: Fix the border-radius value**

In `src/styles/strengths.css`, find `.spi-example` (line 612):

Change:
```css
  border-radius: 8px;
```

To:
```css
  border-radius: var(--st-radius);
```

- [ ] **Step 2: Run tests**

Run: `npx playwright test tests/strengths.spec.ts --reporter=line`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/styles/strengths.css
git commit -m "fix: replace hardcoded border-radius with var(--st-radius) on .spi-example (ATR-39)"
```

---

## Task 3: Increase reorder button touch targets — ATR-40

**Files:**
- Modify: `src/styles/strengths.css:976-986`

- [ ] **Step 1: Update reorder button styles**

In `src/styles/strengths.css`, replace the existing `.sw-island__chip-move-up, .sw-island__chip-move-down` rule (lines 976-986):

Current:
```css
.sw-island__chip-move-up,
.sw-island__chip-move-down {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 0.25rem;
  font-size: 0.65rem;
  line-height: 1;
  opacity: 0.6;
  transition: opacity 0.15s ease;
}
```

New:
```css
.sw-island__chip-move-up,
.sw-island__chip-move-down {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 0.65rem;
  line-height: 1;
  opacity: 0.6;
  transition: opacity 0.15s ease;
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

Changes: `padding` 0 0.25rem → 0.5rem, added `min-width: 44px`, `min-height: 44px`, `display: inline-flex`, `align-items: center`, `justify-content: center`.

- [ ] **Step 2: Run tests**

Run: `npx playwright test tests/strengths.spec.ts --reporter=line`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/styles/strengths.css
git commit -m "fix: increase reorder button touch targets to 44px minimum (ATR-40)"
```

---

## Task 4: Add focus-visible outlines to reorder buttons — ATR-41

**Files:**
- Modify: `src/styles/strengths.css` (after line 995, after the `:disabled` rule)
- Modify: `src/styles/strengths-theme.css` (after `.strengths-page .sw-island__chip-close:hover` block, around line 381)

- [ ] **Step 1: Add base focus-visible rule in strengths.css**

In `src/styles/strengths.css`, after the `.sw-island__chip-move-up:disabled, .sw-island__chip-move-down:disabled` block (line 995), add:

```css
.sw-island__chip-move-up:focus-visible,
.sw-island__chip-move-down:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}
```

- [ ] **Step 2: Add themed override in strengths-theme.css**

In `src/styles/strengths-theme.css`, after the `.strengths-page .sw-island__chip-close:hover` block (around line 381), add:

```css
.strengths-page .sw-island__chip-move-up:focus-visible,
.strengths-page .sw-island__chip-move-down:focus-visible {
  outline-color: var(--st-accent);
}
```

- [ ] **Step 3: Run tests**

Run: `npx playwright test tests/strengths.spec.ts --reporter=line`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add src/styles/strengths.css src/styles/strengths-theme.css
git commit -m "fix: add focus-visible outlines to reorder buttons (ATR-41)"
```

---

## Task 5: Refactor mobile reorder test — ATR-42

**Files:**
- Modify: `tests/strengths.spec.ts:809-839`

- [ ] **Step 1: Refactor the test**

The current test at line 809 uses `browser.newContext({ viewport })` with manual teardown. Replace the test with a new `test.describe` block using `test.use({ viewport })`.

Find the test (inside the `Strengths — Word Reordering` describe block):
```typescript
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
```

Replace with (note: the closing `});` of the `Word Reordering` describe block stays, and a new describe block is added after it):

```typescript
  // Remove the mobile test from inside the Word Reordering block
});

test.describe('Strengths — Word Reordering (mobile)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('reorder buttons work on mobile viewport', async ({ page }) => {
    await page.goto('/strengths');
    await page.waitForSelector('.sw-grid');

    // Select 2 words
    const chips = page.locator('.sw-grid .sw-chip');
    await chips.nth(0).click();
    await chips.nth(1).click();

    // Verify move-down is visible
    const moveDown = page.locator('.sw-island__chip-move-down');
    await expect(moveDown.first()).toBeVisible();

    // Get initial order
    const labels = page.locator('.sw-island__chip-label');
    const initialFirst = await labels.nth(0).textContent();
    const initialSecond = await labels.nth(1).textContent();

    // Click move-down on first
    await moveDown.first().click();

    // Verify swap worked
    const newFirst = await labels.nth(0).textContent();
    const newSecond = await labels.nth(1).textContent();
    expect(newFirst).toBe(initialSecond);
    expect(newSecond).toBe(initialFirst);
  });
});
```

Key changes: removed `browser` fixture, removed manual `newContext`/`close`, use `test.use({ viewport })`, use `page` directly instead of `mobilePage`.

- [ ] **Step 2: Run the refactored test**

Run: `npx playwright test tests/strengths.spec.ts --grep "mobile viewport" --reporter=line`
Expected: PASS

- [ ] **Step 3: Run full test suite**

Run: `npx playwright test --reporter=line`
Expected: All tests PASS (both main-site and strengths tests)

- [ ] **Step 4: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add tests/strengths.spec.ts
git commit -m "refactor: use test.use({ viewport }) for mobile reorder test (ATR-42)"
```

---

## Task 6: Visual verification and Linear cleanup

- [ ] **Step 1: Start dev server and take screenshots at 3 viewports**

Run: `npx astro dev` (if not already running)

Take Playwright screenshots at:
- Desktop: 1280x720
- Tablet: 768x1024
- Mobile: 375x812

Verify buttons look proportional at all sizes. Keyboard-tab through reorder buttons on the Selection Island to verify focus outlines appear.

- [ ] **Step 2: Update Linear issue statuses**

Using Linear MCP `save_issue`:
- ATR-43 → Done
- ATR-39 → Done
- ATR-40 → Done
- ATR-41 → Done
- ATR-42 → Done

- [ ] **Step 3: Update TODO.md**

Mark the 4 PR #4 cleanup items as done. Add the button enlargement as done.
