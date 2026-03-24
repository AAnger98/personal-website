# Strengths Page Polish Pass — Design Spec

**Date:** 2026-03-24
**Branch:** `feature/strengths-polish`
**Linear issues:** ATR-43, ATR-39, ATR-40, ATR-41, ATR-42

## Goal

Bundle five small improvements into a single polish pass: enlarge word buttons (owner feedback), fix theme consistency, improve accessibility, and clean up a test.

## Changes

### 1. Enlarge word buttons and text — ATR-43 (High)

Owner feedback: buttons look too short relative to their width on all viewports.

**Current values** (in `strengths-theme.css`):
- `font-size: 1.15rem`
- `padding: 1rem 1.5rem`
- `min-height: 56px`

**New values** (Option 4, selected from 5-option mockup comparison):
- `font-size: 1.3rem`
- `padding: 1.4rem 1.5rem`
- `min-height: 74px`

Grid columns unchanged (4 → 3 → 2 at existing breakpoints). Add a **new** `@media (max-width: 480px)` rule in `strengths-theme.css` targeting `.strengths-page .sw-chip` to scale padding on small screens: `padding: 1.2rem 1rem`. No such breakpoint currently exists in `strengths-theme.css`.

**Files:** `src/styles/strengths-theme.css`

### 2. Replace hardcoded border-radius — ATR-39 (Low)

`.spi-example` in `strengths.css` uses `border-radius: 8px` instead of `var(--st-radius)`.

**Fix:** Replace with `border-radius: var(--st-radius)`.

**Files:** `src/styles/strengths.css`

### 3. Increase reorder button touch targets — ATR-40 (Medium)

`.sw-island__chip-move-up` and `.sw-island__chip-move-down` are below the 44px minimum touch target.

**Fix:** Add `min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center;` to ensure glyphs are centered within the enlarged target. Current padding is `0.25rem` / font-size `1.1rem` — keep font-size, increase padding to `0.5rem`.

**Files:** `src/styles/strengths.css`

### 4. Add focus-visible outlines to reorder buttons — ATR-41 (Medium)

Reorder buttons lack keyboard focus indicators.

**Fix:** Add base rule in `strengths.css`:
```css
.sw-island__chip-move-up:focus-visible,
.sw-island__chip-move-down:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 2px;
}
```

Add themed override in `strengths-theme.css`:
```css
.strengths-page .sw-island__chip-move-up:focus-visible,
.strengths-page .sw-island__chip-move-down:focus-visible {
  outline-color: var(--st-accent);
}
```

**Files:** `src/styles/strengths.css`, `src/styles/strengths-theme.css`

### 5. Refactor mobile reorder test — ATR-42 (Low)

Mobile reorder test currently uses `browser.newContext({ viewport })` to create a separate browser context with manual teardown (`mobileContext.close()`). Refactor to extract this test into its own `test.describe` block with `test.use({ viewport: { width: 375, height: 812 } })` and remove the manual context creation/teardown.

**Files:** `tests/strengths.spec.ts`

## Out of scope

- Grid column count changes
- Travel animation (ATR-33)
- Definition hover prototypes (ATR-20/21)
- Pitch copy approval (blocked on owner review)
- S5 polish epic items beyond what's listed here (ATR-25/26/27/28/29)

## Testing

- All existing 127 Playwright tests must pass
- Visual verification of button sizing at desktop (1280px), tablet (768px), and mobile (375px)
- Keyboard tab through reorder buttons to verify focus outlines
- No new Playwright tests needed — existing tests cover button rendering, reorder functionality, and mobile viewports. The CSS-only changes (sizing, border-radius, touch targets, focus outlines) are verified by existing selector-based tests continuing to pass plus manual visual/keyboard checks.
