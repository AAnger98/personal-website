# Word Selection Grid Redesign — Design Document

**Date:** 2026-03-21
**Status:** Approved
**Epic:** S2 (Word Selection Layout) + S3 (Definition Hover)

---

## Problem Statement

The current word selection step uses small flex-wrapped pill buttons with subtle border-only state changes. Definitions are loaded from CSV but never displayed. The selection counter is minimal. Users struggle to:

1. Distinguish selected from unselected words at a glance
2. Understand what a word means before selecting it
3. See their selections as a cohesive set
4. Browse definitions after reaching the 5-word max

---

## Design Overview — Three-Zone Layout

The redesigned word selection step uses three stacked zones:

```
┌─────────────────────────────────────────────────┐
│  SELECTION ISLAND (sticky top)                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  ╌╌╌  ╌╌╌│
│  │☑ Word1  │ │☑ Word2  │ │☑ Word3  │  ___  ___ │
│  └─────────┘ └─────────┘ └─────────┘           │
│  3 of 5 selected ━━━━━━━━━━━━░░░░              │
├─────────────────────────────────────────────────┤
│  DEFINITION PREVIEW BAR                         │
│  "Analyzing — Breaking down complex info..."    │
├─────────────────────────────────────────────────┤
│  WORD GRID (scrollable, 4-col / 2-col mobile)  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │☐ Ada │ │☐ Bol │ │☑ Wrd │ │☐ Cre │          │
│  └──────┘ └──────┘ └──────┘ └──────┘          │
│  ... 48 word buttons                            │
└─────────────────────────────────────────────────┘
```

---

## Zone 1: Selection Island

A sticky container pinned to the top of the step that displays the user's current selections.

### Layout
- Horizontal row of up to 5 chip slots
- Empty slots rendered as dashed outlines (affordance: "fill me")
- Progress bar beneath: `━━━━━━━━━░░░` with label `"3 of 5 selected"`

### Chip Behavior
- Each chip displays: `☑ WordName` + `✕` close button to deselect
- Chips are **reorderable** via drag-and-drop (desktop) or long-press-drag (mobile)
- When a word is deselected (from grid OR island), the chip removes and remaining chips reflow

### Sticky Positioning
- `position: sticky; top: 0` — stays visible as user scrolls the grid
- Background matches the page theme with slight elevation/shadow for depth

---

## Zone 2: Definition Preview Bar

A fixed-height bar between the island and the grid that shows word definitions on demand.

### States
- **Idle:** `"Hover over a word to see its definition"` (desktop) / `"Long-press a word to see its definition"` (mobile)
- **Active:** `"Analyzing — Breaking down complex information to find patterns and solutions"`
- **Transition:** Crossfade between definitions (~150ms)

### Interaction
- **Desktop:** Hover any word button (selected or not) to show its definition
- **Mobile:** Long-press any word button to show its definition
- Works on ALL buttons regardless of selection state (solves browse-at-max problem)

### Swappable Architecture
The definition display is abstracted behind a `DefinitionProvider` interface:

```typescript
interface DefinitionDisplay {
  showDefinition(word: string, definition: string): void;
  hideDefinition(): void;
}
```

The grid emits `onWordHover(word)` / `onWordBlur()` events. The consumer component implements the display. Swapping from "preview bar" to "tooltip", "side panel", or "inline expand" = replace one component, zero grid changes.

---

## Zone 3: Word Grid

The main browsing area containing all 48 word buttons.

### Layout
- **CSS Grid:** `grid-template-columns: repeat(4, 1fr)` on desktop
- **Responsive breakpoints:**
  - Desktop (>768px): 4 columns
  - Tablet (480–768px): 3 columns
  - Mobile (<480px): 2 columns
- Gap: `var(--space-md)` between buttons
- Container scrolls naturally with the page (no fixed-height scroll container)

### Button Sizing
- Significantly larger than current pills
- Minimum touch target: 44x44px (WCAG)
- Generous padding for readability
- Font size increased from current `var(--font-size-sm)` to body-size or larger

---

## Button States

Each button uses a checkbox + color fill + text weight for triple-redundant state signaling.

| State | Checkbox | Background | Border | Text | Opacity |
|-------|----------|------------|--------|------|---------|
| **Unselected** | `☐` | Transparent / ghost | Light border | Normal weight | 100% |
| **Unselected + hover** | `☐` | Subtle hover tint | Accent border | Normal weight | 100% |
| **Selected** | `☑` | Filled accent color | Accent border | Bold | 100% |
| **Selected + hover** | `☑` | Darker accent fill | Accent border | Bold | 100% |
| **At max (unselectable)** | `☐` | Transparent | Light border | Normal weight | 50% dimmed |
| **At max + hover** | `☐` | Transparent | Hover border | Normal weight | 75% (brightens) |

### Key Rule: Never Truly Disabled
At max selections, unselected buttons are visually dimmed but **not** `disabled` in HTML. They remain interactive for hover/focus to support definition browsing. Click is a no-op (does not select a 6th word).

---

## Travel Animation

When a word is selected:

1. Button in grid transitions to **selected state** (checkbox fills, background changes)
2. A **ghost copy** of the word chip animates from the button's position upward to the Selection Island
3. Ghost lands in the next empty slot; the real chip renders in place
4. Animation: ~300ms ease-out

When deselected:

1. Island chip fades/shrinks out (~200ms)
2. Grid button transitions back to unselected state
3. Remaining island chips reflow to close the gap

### Implementation Note
The animation uses `position: fixed` for the ghost element during transit, calculated from `getBoundingClientRect()` of source and target. The ghost is removed from DOM after animation completes.

---

## At-Max Behavior (Edge Case)

When 5 words are selected:

- Remaining unselected buttons dim to 50% opacity
- **Click does nothing** — no accidental 6th selection
- **Hover/long-press still shows definitions** — buttons are not `disabled`
- Hovering a dimmed button brightens it to 75% (signals interactivity)
- Counter text changes: `"5 of 5 selected — deselect one to choose another"`
- Definition Preview Bar continues to function normally

**User story:** "I have 5 selected, but I want to check what 'Synthesizing' means. I hover it, read the definition, decide it's better than 'Organizing', deselect 'Organizing' from the island, then select 'Synthesizing'."

---

## Selection Counter

Located inside the Selection Island zone, beneath the chips.

### Display
- Progress bar: filled segments proportional to selections (e.g., 3/5 = 60%)
- Text label: `"3 of 5 selected"`
- At max: `"5 of 5 selected — deselect one to choose another"`
- At zero: `"Select 5 words that resonate with you"`

### Updates
- Counter updates immediately on every select/deselect
- Progress bar animates smoothly between states

---

## Accessibility Requirements

| Requirement | Implementation |
|---|---|
| Button role | `role="checkbox"` with `aria-checked="true/false"` |
| Island live region | `aria-live="polite"` announces additions/removals |
| Definition bar | `aria-live="polite"` announces definition text |
| Focus management | Arrow keys navigate grid; Tab moves between zones |
| Contrast | All states meet WCAG AA (4.5:1 for text) |
| Touch targets | Minimum 44x44px on all interactive elements |
| Color independence | Checkbox + weight change = non-color-dependent state signal |
| Screen reader | Selected count announced on change |

---

## Agent Assignments

| Task | Agent | Linear Issue |
|---|---|---|
| Selection Island component (sticky, 5 slots, reorder, progress) | Front End | New |
| Travel animation (ghost copy, ease-out to island) | Front End | New |
| Resize word buttons — bigger with larger text | Front End | ATR-15 |
| Rewrite word grid to CSS Grid 4-col responsive | Front End | ATR-16 |
| Checkbox toggle state on buttons (☐/☑ + fill) | Front End | New |
| Definition Preview Bar component | Front End | New |
| At-max dimming with hover-still-active behavior | Front End | New |
| DefinitionProvider abstraction (swappable strategy) | Front End | New |
| Remove rank-ordering by selection order | Front End | ATR-17 |
| Add reordering capability (drag in island) | Front End | ATR-18 |
| Test mobile responsiveness with new sizing | Test Engineer | ATR-19 |
| Accessibility review — definitions + island | Security Engineer | ATR-21 |
| Accessibility pass — contrast + focus states | Security Engineer | ATR-27 |
| Code review: theme isolation | Code Reviewer | ATR-14 |
| Code review: swappable definition architecture | Code Reviewer | New |

---

## Open Questions

None — all decisions resolved during brainstorming session.

---

## References

- [NNGroup Toggle Switch Guidelines](https://www.nngroup.com/articles/toggle-switch-guidelines/)
- [Mobile UX Design: Multi-Select Solutions](https://boundstatesoftware.com/articles/mobile-ux-design-exploring-multi-select-solutions)
- [Material Design Selection Patterns](https://m1.material.io/patterns/selection.html)
- Sporcle.com — "Selection Island" pattern inspiration (persistent collection dock for selected answers)
