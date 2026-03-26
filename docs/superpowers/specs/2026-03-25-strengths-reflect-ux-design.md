# Strengths Reflect UX Improvements

**Date:** 2026-03-25
**Status:** Draft

---

## Summary

Five changes to the strengths workflow improving the reflect step's usability: drag-and-drop card reordering on the reflection screen, back navigation on the feedback step, contextual placeholder text in reflection textareas, a mobile checkbox wrapping fix, and removal of the now-unnecessary reorder buttons from the selection screen.

---

## Change 1: Drag-and-Drop Reordering on Reflection Step

### Current behavior
Reordering exists only on the word selection screen via up/down arrow buttons in the sticky island. Once the user advances to reflection, the order is locked.

### New behavior
Each reflection card (word + two textareas) is draggable. Users reorder their 5 strengths by dragging cards up or down on the reflection screen.

### Implementation details

**Drag handle:**
- A grip icon (`⠿` braille pattern or `≡`) at the top-left of each reflection card
- Styled in `--color-gold`, cursor changes to `grab` / `grabbing`
- Visible on all screen sizes

**Desktop drag (HTML Drag & Drop API):**
- `draggable="true"` on each card container
- `dragstart`: store dragged index, apply lifted visual state (reduced opacity, gold border highlight)
- `dragover`: calculate drop position from cursor Y, show a drop indicator line between cards
- `drop`: reorder `selectedWords` array; `reflections` data follows the word key so content is preserved
- `dragend`: clean up visual states

**Mobile touch support:**
- `touchstart`: record finger position and dragged card index
- `touchmove`: translate the card visually with the finger, calculate drop position from touch Y coordinates
- `touchend`: commit reorder or snap back if no valid drop target
- Prevent scroll interference during active drag via `touch-action: none` on the drag handle

**Visual feedback:**
- Card number labels (1–5) update dynamically after reorder
- Drop indicator: a 2px `--color-gold` horizontal line between cards at the insertion point
- Transitions use `steps(4)` for Terminal Deco aesthetic consistency

**Keyboard accessibility:**
- Drag handle is focusable (`tabIndex={0}`)
- `Space` or `Enter` on a focused handle enters "keyboard drag mode" — announce via `aria-live` region
- `ArrowUp` / `ArrowDown` moves the card; `Escape` cancels; `Space` or `Enter` confirms the drop
- This replaces the accessibility provided by the removed up/down buttons on the selection screen

**Edge cases:**
- Dropping a card back on its original position: no-op, no state mutation
- `Escape` key during drag: cancel drag, snap card back to original position
- Auto-scroll: if the card list extends beyond the viewport during drag, scroll the container when the drag position nears the top or bottom edge

**State management:**
- `StrengthsFlow.tsx` adds an `onReorder: (reordered: string[]) => void` callback prop passed to `ReflectionStep`
- `onReorder` calls `setSelectedWords(reordered)` in the parent, keeping the source of truth in StrengthsFlow
- Reflection content keyed by word string, so reordering the array preserves all textarea content
- Reordered position carries through to Pitch (`topWord = selectedWords[0]`) and PDF generation

---

## Change 2: Add Back Navigation to Feedback Step

### Current behavior
Back buttons already exist on Reflection (→ Word Selection), Pitch (→ Reflection), and PDF (→ Pitch). However, the Feedback step has no back button — once you reach it, you can only submit or skip.

### New behavior
Add a "BACK" button to the Feedback step that returns to the PDF/Download step.

### Implementation details

**Pattern:** Follow the existing `onBack` prop pattern used by ReflectionStep, PitchStep, and PdfDownloadStep.

- Add `onBack: () => void` to FeedbackStep's Props interface
- Pass `onBack={() => setStep('pdf')}` from StrengthsFlow
- Render a "BACK" button using the same `sw-btn sw-btn--ghost` class used on other steps
- Back button should be available both before and after submission (user may want to re-download the PDF)

---

## Change 3: Contextual Placeholder Text in Reflection Textareas

### Current behavior
All textareas use the same generic placeholder text regardless of which word is being reflected on:
- Why: `e.g. "I chose this because I naturally find myself doing it without being asked..."`
- Moment: `e.g. "I remember a time when our team was stuck and I..."`

### New behavior
Placeholders are contextual to the selected word. Examples for "Analyzing":
- Why: `"I am at my best when I'm analyzing..."`
- Moment: `"A time when analyzing made a real difference was..."`

### Implementation details

**Placeholder generation:**
- Template functions that interpolate the word:
  - Why: `"I am at my best when I'm ${word.toLowerCase()}..."`
  - Moment: `"A time when ${word.toLowerCase()} made a real difference was..."`
- Words in the wordlist are gerunds (e.g. "Analyzing", "Strategizing", "Leading"), so lowercase insertion reads naturally

**Location:** Change `PROMPTS` from a static array to a function that accepts the word and returns the prompt tuples with interpolated placeholders.

---

## Change 4: Mobile Checkbox Wrapping Fix

### Current behavior
On small mobile screens, the Unicode checkbox character (☑/☐) sometimes wraps to a separate line from the word text inside the chip button.

### Fix
Add `white-space: nowrap` to the `.sw-chip` button styling so the checkbox character and word text always stay on the same line.

---

## Change 5: Remove Reorder Buttons from Selection Screen

### Current behavior
Each selected word chip in the sticky island has up/down arrow buttons (▲/▼) for reordering.

### New behavior
Remove the up/down buttons and the `handleReorder` function from `WordSelectionStep.tsx`. Reordering now happens exclusively on the reflection screen (Change 1).

### What to remove
- The `▲` (move up) and `▼` (move down) buttons from the island chip markup
- The `handleReorder` function
- Associated CSS classes: `.sw-island__chip-move-up`, `.sw-island__chip-move-down`
- Related disabled-state logic for first/last position
- Any test assertions specific to selection-screen reordering

---

## Files affected

| File | Changes |
|---|---|
| `src/components/strengths/ReflectionStep.tsx` | Drag-and-drop logic, contextual placeholders, onReorder callback |
| `src/components/strengths/StrengthsFlow.tsx` | `onReorder` prop, `onBack` for FeedbackStep |
| `src/components/strengths/WordSelectionStep.tsx` | Remove reorder buttons and handleReorder |
| `src/components/strengths/FeedbackStep.tsx` | Add `onBack` prop and back button |
| `src/styles/strengths.css` | Drag handle styles, drop indicator, remove reorder button CSS, nowrap fix |
| `src/styles/strengths-theme.css` | Drag handle theme overrides if needed |
| `tests/strengths.spec.ts` | Replace selection-screen reorder tests with reflection-screen drag tests, add feedback back nav test, update placeholder assertions |

---

## Testing requirements

- Drag-and-drop reorder on reflection step changes card order and preserves textarea content
- Keyboard reorder (Space to grab, ArrowUp/Down to move, Space to drop) works equivalently
- Reordered words carry through to pitch (top word) and PDF
- Feedback step back button returns to PDF step
- Contextual placeholders display the correct word for each strength
- Checkbox and word text stay on same line on mobile viewports
- Selection screen no longer shows reorder buttons
- Existing selection-screen reorder tests are replaced (not just deleted) with reflection-screen equivalents
