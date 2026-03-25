# Production Readiness — Final Polish & Ship

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close all remaining strengths page TODOs (accessibility, transitions, mobile UX, final review) and ship to production.

**Architecture:** All tasks operate on existing files — no new components. Accessibility fixes are CSS + attribute changes. Transition polish is CSS-only. Mobile UX is a Playwright-driven review + targeted fixes. Final review is a verification gate.

**Tech Stack:** Astro, React (TSX), CSS custom properties, Playwright (E2E)

**Linear issues closed by this plan:** ATR-21, ATR-25, ATR-26, ATR-27, ATR-29, ATR-9

---

## File Map

| File | Role | Tasks |
|---|---|---|
| `src/styles/strengths-theme.css` | Theme overrides for /strengths | 2, 3, 4 |
| `src/styles/strengths.css` | Base strengths styles | 3 |
| `src/components/strengths/PitchStep.tsx` | Pitch step (examples) | 5 (conditional) |
| `tests/strengths.spec.ts` | E2E tests | 1, 6 |

---

### Task 1: Tooltip Accessibility Tests (ATR-21)

The floating tooltip already has `role="tooltip"`, `id="sw-definition-tooltip"`, `aria-describedby` on the triggering button, `onFocus`/`onBlur` handlers for keyboard users, and the definition bar uses `aria-live="polite"`. Existing tests at line 273 already verify `role="tooltip"` and `aria-describedby`. This task adds the two missing tests: keyboard focus trigger and definition bar live region.

**Files:**
- Test: `tests/strengths.spec.ts`

- [ ] **Step 1: Write two new accessibility tests**

Add to `tests/strengths.spec.ts` in a new describe block after the existing tooltip tests:

```typescript
test.describe('Strengths — Tooltip Accessibility', () => {
  test('focusing a word chip via keyboard shows the tooltip', async ({ page }) => {
    await page.goto('/strengths');
    await page.waitForSelector('.sw-grid');
    const chip = page.locator('.sw-chip').first();
    await chip.focus();
    const tooltip = page.locator('#sw-definition-tooltip');
    await expect(tooltip).toBeVisible();
  });

  test('definition bar has aria-live="polite"', async ({ page }) => {
    await page.goto('/strengths');
    await page.waitForSelector('.sw-grid');
    const bar = page.locator('.sw-definition-bar');
    await expect(bar).toHaveAttribute('aria-live', 'polite');
  });
});
```

- [ ] **Step 2: Run tests to verify they pass (these test existing behavior)**

Run: `npx playwright test tests/strengths.spec.ts --grep "Tooltip Accessibility"`
Expected: Both pass (the implementation already has these attributes)

- [ ] **Step 3: Commit**

```bash
git add tests/strengths.spec.ts
git commit -m "test: add tooltip accessibility tests (ATR-21)"
```

---

### Task 2: Contrast & Opacity Fix (ATR-27)

WCAG AA requires 4.5:1 for normal text, 3:1 for large text (18px+ or 14px bold).

The current `--st-text-secondary` (#9ca3af) and `--st-text-muted` (#8b95a3) on `--st-bg` (#111827) already pass WCAG AA (~7:1 and ~5.9:1 respectively). **No color changes needed.**

The one real issue: the base `.sw-definition-bar__prompt` in `strengths.css:856-860` has `opacity: 0.5`. The theme override at `strengths-theme.css:342` sets the color to `--st-text-muted` but does not reset opacity, so the 0.5 opacity cascades through, halving the effective contrast.

**Files:**
- Modify: `src/styles/strengths-theme.css` (line 342-345)

- [ ] **Step 1: Add opacity reset to theme override**

In `src/styles/strengths-theme.css`, update the existing `.sw-definition-bar__prompt` rule:

```css
/* Before (line 342-345) */
.strengths-page .sw-definition-bar__prompt {
  color: var(--st-text-muted);
  font-size: 1.05rem;
}

/* After */
.strengths-page .sw-definition-bar__prompt {
  color: var(--st-text-muted);
  font-size: 1.05rem;
  opacity: 1;
}
```

- [ ] **Step 2: Run full test suite**

Run: `npx playwright test tests/strengths.spec.ts`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add src/styles/strengths-theme.css
git commit -m "fix: reset opacity on definition bar prompt for WCAG contrast (ATR-27)"
```

---

### Task 3: Step Transition Polish (ATR-25)

Current: `sf-fade-in` does opacity 0->1 + translateY(6px->0) in 0.25s. This is functional but abrupt. Polish with a slightly longer, smoother feel. Verification is visual only (during Task 6 Step 4).

**Files:**
- Modify: `src/styles/strengths.css` (lines 1-10)
- Modify: `src/styles/strengths-theme.css` (add theme override for smooth easing)

- [ ] **Step 1: Update base transition**

In `src/styles/strengths.css`, update:

```css
.sf-step-transition {
  animation: sf-fade-in 0.3s ease-out;
}

@keyframes sf-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 2: Add theme override for strengths page**

In `src/styles/strengths-theme.css`, add after the root variable block (around line 44):

```css
.strengths-page .sf-step-transition {
  animation-duration: 0.35s;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
```

- [ ] **Step 3: Run tests to confirm nothing broke**

Run: `npx playwright test tests/strengths.spec.ts`
Expected: All tests pass (animations don't affect test assertions)

- [ ] **Step 4: Commit**

```bash
git add src/styles/strengths.css src/styles/strengths-theme.css
git commit -m "polish: smoother step transitions (ATR-25)"
```

---

### Task 4: Mobile UX Pass (ATR-26)

Playwright-driven review at 375px (iPhone SE) and 768px (tablet) viewports. Use `webapp-testing` skill to capture screenshots and identify issues. Commit only if fixes are needed.

**Files:**
- Modify: `src/styles/strengths-theme.css` (responsive overrides, only if issues found)

- [ ] **Step 1: Run existing mobile tests**

Run: `npx playwright test tests/strengths.spec.ts --grep "Mobile|Tablet"`
Expected: All mobile/tablet tests pass

- [ ] **Step 2: Visual review at 375px via Playwright**

Use Playwright to navigate through all 5 steps at 375px width. Capture screenshots. Check:
1. Definition bar text — not truncated or overflowing
2. Pitch textarea — tall enough to type comfortably
3. Progress bar labels — readable at small sizes
4. Footer buttons — not clipped or overlapping
5. Rating buttons in feedback step — wrapping correctly (already fixed in PR #6)

- [ ] **Step 3: If issues found, add targeted CSS fixes**

Add fixes inside existing `@media (max-width: 480px)` blocks in `src/styles/strengths-theme.css`. If no issues found, skip to commit with a no-op note.

- [ ] **Step 4: Run full test suite**

Run: `npx playwright test tests/strengths.spec.ts`
Expected: All tests pass

- [ ] **Step 5: Commit (only if changes were made)**

```bash
git add src/styles/strengths-theme.css
git commit -m "polish: mobile UX fixes (ATR-26)"
```

If no changes needed, skip this step and note "ATR-26: verified — no issues found at 375px and 768px."

---

### Task 5: Pitch Example Copy (CONDITIONAL — requires owner approval)

**Skip this task if the owner has not yet approved the pitch examples.**

If approved as-is, no code changes needed — just close the TODO item.

If changes requested, update `PITCH_EXAMPLES` array in `src/components/strengths/PitchStep.tsx` lines 5-21.

**Files:**
- Modify: `src/components/strengths/PitchStep.tsx` (lines 5-21, only if changes needed)

- [ ] **Step 1: Apply owner-approved copy changes (if any)**

Update the `PITCH_EXAMPLES` array with approved text.

- [ ] **Step 2: Run tests**

Run: `npx playwright test tests/strengths.spec.ts --grep "Pitch"`
Expected: All pitch tests pass

- [ ] **Step 3: Commit**

```bash
git add src/components/strengths/PitchStep.tsx
git commit -m "content: update pitch examples per owner approval"
```

---

### Task 6: Final Review Gate (ATR-29)

Run full test suite, TypeScript check, production build, and visual review before marking production-ready. This task closes ATR-29 and the parent epic ATR-9.

**Files:**
- Read-only: all source files (verification pass)

- [ ] **Step 1: TypeScript compile check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Full Playwright test suite**

Run: `npx playwright test`
Expected: All tests pass (78+ tests)

- [ ] **Step 3: Build for production**

Run: `npx astro build`
Expected: Clean build, no warnings

- [ ] **Step 4: Visual review with Playwright screenshots**

Use Playwright to capture screenshots of each step at desktop (1280px) and mobile (375px) viewports. Verify:
- Step 1: Word grid renders, island visible, tooltip appears on hover, transition feels smooth
- Step 2: Reflection inputs render for all 5 words
- Step 3: Pitch examples visible, textarea functional
- Step 4: PDF download button renders
- Step 5: Feedback rating buttons render, submission works
- Definition bar prompt text is clearly readable (opacity fix from Task 2)

- [ ] **Step 5: Update Linear issues**

Mark Done: ATR-21, ATR-25, ATR-26, ATR-27, ATR-29, ATR-9

- [ ] **Step 6: Update TODO.md**

Mark all S5 items as complete. Convert "Remaining Work" section to "Completed" summary.

- [ ] **Step 7: Final commit**

```bash
git add TODO.md
git commit -m "chore: mark all polish tasks complete — production ready"
```

---

## Execution Order

Tasks 1–4 are independent and can run in parallel.
Task 5 is conditional on owner input.
Task 6 runs after all others complete.

```
┌─────────────────────────────────┐
│  Task 1: Tooltip A11y (ATR-21)  │──┐
│  Task 2: Contrast Fix (ATR-27)  │──┤
│  Task 3: Transitions (ATR-25)   │──┼── Task 6: Final Review (ATR-29)
│  Task 4: Mobile UX (ATR-26)     │──┤
│  Task 5: Pitch Copy (if needed) │──┘
└─────────────────────────────────┘
```
