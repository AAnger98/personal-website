# Strengths Reflect UX Improvements

**Date:** 2026-03-25
**Status:** Draft

---

## Summary

Five changes to the strengths workflow improving the reflect step's usability: drag-and-drop card reordering on the reflection screen, back navigation across all steps, contextual placeholder text in reflection textareas, a mobile checkbox wrapping fix, and removal of the now-unnecessary reorder buttons from the selection screen.

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

**State management:**
- Reorder mutates `selectedWords` array in `StrengthsFlow.tsx` via a callback prop passed to `ReflectionStep`
- Reflection content keyed by word string, so reordering the array preserves all textarea content
- Reordered position carries through to Pitch (`topWord = selectedWords[0]`) and PDF generation

---

## Change 2: Back Navigation Across All Steps

### Current behavior
Each step has only forward navigation (continue/complete) and a "START OVER" reset. No way to return to a previous step.

### New behavior
A "BACK" button on every step after Word Selection:
- Reflection → Word Selection
- Pitch → Reflection
- PDF → Pitch
- Feedback → PDF

### Implementation details

**Button placement:** Bottom-left of each step's action area, alongside existing forward buttons.

**Styling:** Courier New, uppercase, bold — matching existing button patterns. Secondary visual weight (outline or muted) so the primary action (continue) remains dominant.

**State preservation:** All state is preserved when navigating backward. Returning to Reflection from Pitch keeps all reflection text intact. Returning to Word Selection from Reflection keeps selections and any partial reflections.

**Step setter:** `StrengthsFlow.tsx` passes a `onBack` callback to each step component. Each step calls `onBack()` which sets the step state to the previous step value.

---

## Change 3: Contextual Placeholder Text in Reflection Textareas

### Current behavior
All textareas use the same generic placeholder text regardless of which word is being reflected on:
- Why: `e.g. "I chose this because I naturally find myself doing it without being asked..."`
- Moment: `e.g. "I remember a time when our team was stuck and I..."`

### New behavior
Placeholders are contextual to the selected word. Examples for "Analyzing":
- Why: `"I am at my best when I'm analyzing..."`
- Moment: `"A time my analyzing made a difference was..."`

### Implementation details

**Placeholder generation:**
- Template functions that interpolate the word:
  - Why: `"I am at my best when I'm ${word.toLowerCase()}..."`
  - Moment: `"A time my ${word.toLowerCase()} made a difference was..."`
- Words in the wordlist are gerunds (e.g. "Analyzing", "Strategizing", "Leading"), so lowercase insertion reads naturally

**Location:** Update the `PROMPTS` definition in `ReflectionStep.tsx` to accept the word and generate dynamic placeholders, or compute placeholders inline when rendering each word's textareas.

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
| `src/components/strengths/ReflectionStep.tsx` | Drag-and-drop logic, contextual placeholders, back button |
| `src/components/strengths/StrengthsFlow.tsx` | Reorder callback prop, back navigation state, onBack props |
| `src/components/strengths/WordSelectionStep.tsx` | Remove reorder buttons and handleReorder |
| `src/components/strengths/PitchStep.tsx` | Add back button |
| `src/components/strengths/PdfDownloadStep.tsx` | Add back button |
| `src/components/strengths/FeedbackStep.tsx` | Add back button |
| `src/styles/strengths.css` | Drag handle styles, drop indicator, remove reorder button CSS, nowrap fix |
| `src/styles/strengths-theme.css` | Drag handle theme overrides if needed |
| `tests/strengths.spec.ts` | Update reorder tests, add back nav tests, update placeholder assertions |

---

## Testing requirements

- Drag-and-drop reorder on reflection step changes card order and preserves textarea content
- Reordered words carry through to pitch (top word) and PDF
- Back button on each step returns to previous step with state preserved
- Contextual placeholders display the correct word
- Checkbox and word text stay on same line on mobile viewports
- Selection screen no longer shows reorder buttons
