# Strengths Identifier — Epics 2–6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Strengths Identifier flow: Reflection (Step 2), Elevator Pitch (Step 3), PDF Download (Step 4), Feedback Survey (Step 5), and full flow infrastructure (progress indicator, back-navigation, restart).

**Architecture:** All state lives in `StrengthsFlow.tsx` and is passed down as props. Each step is a pure React component that receives data and fires `onComplete(data)`. PDF is generated client-side with jsPDF. No server state, no localStorage — fully ephemeral per session.

**Tech Stack:** Astro 5, React 18, TypeScript strict, jsPDF (client-side PDF), Plausible (telemetry), Playwright (E2E tests)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/components/strengths/StrengthsFlow.tsx` | Full session state, step routing, progress |
| Create | `src/components/strengths/StepProgress.tsx` | 5-step progress indicator |
| Create | `src/components/strengths/ReflectionStep.tsx` | Step 2 — reflection text inputs |
| Create | `src/components/strengths/PitchStep.tsx` | Step 3 — elevator pitch textarea |
| Create | `src/components/strengths/PdfDownloadStep.tsx` | Step 4 — jsPDF generation + download |
| Create | `src/components/strengths/FeedbackStep.tsx` | Step 5 — optional 2-question survey |
| Modify | `src/styles/strengths.css` | New styles for Steps 2–5 + progress + navigation |
| Modify | `src/lib/telemetry.ts` | No changes needed — `logEvent` is already generic |
| Create | `tests/strengths.spec.ts` | Playwright E2E for full flow |

---

## Task 0: PDF Library Spike

**Do this first — PDF generation is flagged as the highest technical risk.**

**Files:**
- Create: `src/components/strengths/PdfDownloadStep.tsx` (stub only for PoC)

- [ ] **Step 1: Install jsPDF**

jsPDF ships its own TypeScript declarations — no `@types/jspdf` package exists or is needed.

```bash
npm install jspdf
```

- [ ] **Step 2: Build a PoC PDF in a throwaway script to verify it works in Astro/React**

Create a temporary `src/components/strengths/_pdf-poc.tsx` (delete after spike):

```tsx
// _pdf-poc.tsx — spike only, delete after Task 0
import { jsPDF } from 'jspdf';

export function generatePocPdf() {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  doc.setFontSize(24);
  doc.text('My Top Strengths', 72, 72);
  doc.setFontSize(12);
  doc.text('1. Building', 72, 120);
  doc.text('2. Strategizing', 72, 140);
  doc.save('strengths-poc.pdf');
}
```

- [ ] **Step 3: Call `generatePocPdf()` from a button in `strengths.astro` temporarily**

In `src/pages/strengths.astro`, add a temporary inline script to your dev environment — or just import and call it from `StrengthsFlow.tsx` behind a dev-only button. Verify the PDF downloads and is readable in the browser.

- [ ] **Step 4: Verify PDF works across Chrome, Safari, and Firefox**

Open `npm run dev`, navigate to `/strengths`, trigger the button. Confirm PDF downloads in all three browsers.

- [ ] **Step 5: Remove the PoC file and any temporary wiring**

```bash
rm src/components/strengths/_pdf-poc.tsx
```

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit spike decision**

```bash
git add package.json package-lock.json
git commit -m "chore: add jsPDF — confirmed compatible with Astro/React client components"
```

---

## Task 1: Expand Flow State + Progress Indicator

**Update `StrengthsFlow.tsx` with the full session state model for all 5 steps. Add the `StepProgress` component.**

**Files:**
- Modify: `src/components/strengths/StrengthsFlow.tsx`
- Create: `src/components/strengths/StepProgress.tsx`
- Modify: `src/styles/strengths.css`

- [ ] **Step 1: Write the failing Playwright test**

In `tests/strengths.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Strengths flow — progress indicator', () => {
  test('shows step 1 of 5 on load', async ({ page }) => {
    await page.goto('/strengths');
    await expect(page.getByText('1 of 5')).toBeVisible();
  });

  test('shows step 2 of 5 after word selection', async ({ page }) => {
    await page.goto('/strengths');
    // Select 5 words by clicking the first 5 chips
    const chips = page.locator('.sw-chip');
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
    const chips = page.locator('.sw-chip');
    for (let i = 0; i < 5; i++) {
      await chips.nth(i).click();
    }
    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await page.getByRole('button', { name: /START OVER/i }).click();
    await expect(page.getByText('1 of 5')).toBeVisible();
    await expect(page.locator('.sw-chip--selected')).toHaveCount(0);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx playwright test tests/strengths.spec.ts --reporter=line
```

Expected: FAIL — `StepProgress` doesn't exist yet, "1 of 5" not in DOM.

- [ ] **Step 3: Create `StepProgress.tsx`**

```tsx
// src/components/strengths/StepProgress.tsx
interface Props {
  current: number; // 1-based
  total: number;
  onRestart: () => void;
}

const STEP_LABELS = ['Select', 'Reflect', 'Pitch', 'Download', 'Feedback'];

export default function StepProgress({ current, total, onRestart }: Props) {
  return (
    <div className="sp-root">
      <div className="sp-steps">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < current;
          const isCurrent = stepNum === current;
          return (
            <div
              key={label}
              className={`sp-step${isDone ? ' sp-step--done' : ''}${isCurrent ? ' sp-step--current' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className="sp-step__num">{isDone ? '✓' : stepNum}</span>
              <span className="sp-step__label">{label}</span>
            </div>
          );
        })}
      </div>
      <div className="sp-meta">
        <span className="sp-meta__count">{current} of {total}</span>
        <button className="sp-restart" onClick={onRestart} type="button">
          START OVER
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update `StrengthsFlow.tsx` with full state model**

**Note:** This replaces the entire file. The old `selections` state variable is renamed to `selectedWords`. This is intentional — the new name is unambiguous when passed as a prop to child components.

Replace the entire file:

```tsx
// src/components/strengths/StrengthsFlow.tsx
import { useState, useEffect } from 'react';
import { logEvent } from '../../lib/telemetry';
import WordSelectionStep, { type Word } from './WordSelectionStep';
import StepProgress from './StepProgress';

interface Props {
  words: Word[];
}

export interface Reflection {
  why: string;
  moment: string;
}

export type Step = 'word-selection' | 'reflection' | 'pitch' | 'pdf' | 'feedback';

const STEP_NUMBER: Record<Step, number> = {
  'word-selection': 1,
  'reflection': 2,
  'pitch': 3,
  'pdf': 4,
  'feedback': 5,
};

export default function StrengthsFlow({ words }: Props) {
  const [step, setStep] = useState<Step>('word-selection');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [reflections, setReflections] = useState<Record<string, Reflection>>({});
  const [pitch, setPitch] = useState('');

  // Fire flow-started telemetry once on mount — enables abandonment-rate-by-step calculation
  useEffect(() => {
    logEvent('strengths_flow_started');
  }, []);

  const handleRestart = () => {
    logEvent('strengths_flow_started'); // re-fires on each restart session
    setStep('word-selection');
    setSelectedWords([]);
    setReflections({});
    setPitch('');
  };

  return (
    <div>
      <StepProgress
        current={STEP_NUMBER[step]}
        total={5}
        onRestart={handleRestart}
      />

      {step === 'word-selection' && (
        <WordSelectionStep
          words={words}
          onComplete={selected => {
            setSelectedWords(selected);
            setStep('reflection');
          }}
        />
      )}

      {step === 'reflection' && (
        <div className="sw-root">
          <div className="sw-header">
            <div className="sw-header__left">
              <span className="sw-label">STEP 2 OF 5</span>
              <h1 className="sw-title">Reflect</h1>
              <p className="sw-desc">Reflection step — coming in Task 2.</p>
            </div>
          </div>
          <ul className="sw-selections-list">
            {selectedWords.map(w => (
              <li key={w} className="sw-chip sw-chip--selected">{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Add progress styles to `src/styles/strengths.css`**

Append to the file:

```css
/* ─── Step Progress ──────────────────────────────────────────────────────── */

.sp-root {
  max-width: 72rem;
  margin: 0 auto;
  padding: var(--space-md) var(--space-md) 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
  border-bottom: 1px solid var(--color-green);
  margin-bottom: var(--space-md);
}

.sp-steps {
  display: flex;
  gap: var(--space-md);
}

.sp-step {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  opacity: 0.4;
}

.sp-step--done,
.sp-step--current {
  opacity: 1;
}

.sp-step__num {
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  font-weight: bold;
  color: var(--color-green);
  width: 1.25rem;
  text-align: center;
}

.sp-step--current .sp-step__num {
  color: var(--color-gold);
}

.sp-step--done .sp-step__num {
  color: var(--color-blue);
}

.sp-step__label {
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text);
}

.sp-meta {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.sp-meta__count {
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.sp-restart {
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-text);
  background: transparent;
  border: 1px solid var(--color-green);
  padding: 0.25rem 0.6rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity steps(2), border-color steps(2);
}

.sp-restart:hover {
  opacity: 1;
  border-color: var(--color-peach);
  color: var(--color-peach);
}

@media (max-width: 600px) {
  .sp-root {
    flex-direction: column;
    align-items: flex-start;
  }

  .sp-step__label {
    display: none;
  }
}
```

- [ ] **Step 6: Run tests**

```bash
npx playwright test tests/strengths.spec.ts --reporter=line
```

Expected: progress indicator tests PASS.

- [ ] **Step 7: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/strengths/StrengthsFlow.tsx src/components/strengths/StepProgress.tsx src/styles/strengths.css tests/strengths.spec.ts
git commit -m "feat: expand flow state model and add step progress indicator"
```

---

## Task 2: Reflection Step (Epic 2)

**Files:**
- Create: `src/components/strengths/ReflectionStep.tsx`
- Modify: `src/components/strengths/StrengthsFlow.tsx`
- Modify: `src/styles/strengths.css`

- [ ] **Step 1: Write the failing Playwright test**

Add to `tests/strengths.spec.ts`:

```typescript
test.describe('Strengths flow — reflection step', () => {
  // Helper: get to reflection step
  async function goToReflection(page: Page) {
    await page.goto('/strengths');
    const chips = page.locator('.sw-chip');
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
    await expect(page.locator('.sr-nudge').first()).toBeVisible();
  });

  test('nudge disappears when field has 50+ chars', async ({ page }) => {
    await goToReflection(page);
    const firstTextarea = page.locator('.sr-field textarea').first();
    await firstTextarea.fill('a'.repeat(50));
    await expect(page.locator('.sr-nudge').first()).not.toBeVisible();
  });

  test('advancing to step 3 shows pitch step', async ({ page }) => {
    await goToReflection(page);
    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await expect(page.getByText('3 of 5')).toBeVisible();
  });
});
```

Add `import type { Page } from '@playwright/test';` at the top of the file.

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx playwright test tests/strengths.spec.ts -g "reflection" --reporter=line
```

Expected: FAIL.

- [ ] **Step 3: Create `ReflectionStep.tsx`**

```tsx
// src/components/strengths/ReflectionStep.tsx
import { useState, useRef } from 'react';
import { logEvent } from '../../lib/telemetry';
import type { Reflection } from './StrengthsFlow';

interface Props {
  selectedWords: string[];
  onComplete: (reflections: Record<string, Reflection>) => void;
  onBack: () => void;
}

const MIN_CHARS = 50;

const PROMPTS: [keyof Reflection, string, string][] = [
  ['why', 'Why did you choose this word?', 'e.g. "I chose this because I naturally find myself doing it without being asked..."'],
  ['moment', 'What experience or moment brought this word to mind?', 'e.g. "I remember a time when our team was stuck and I..."'],
];

export default function ReflectionStep({ selectedWords, onComplete, onBack }: Props) {
  const [fields, setFields] = useState<Record<string, Reflection>>(
    () => Object.fromEntries(selectedWords.map(w => [w, { why: '', moment: '' }]))
  );
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const fieldTimers = useRef<Record<string, number>>({});
  const fieldStart = useRef<Record<string, number>>({});

  const handleChange = (word: string, key: keyof Reflection, value: string) => {
    setFields(prev => ({
      ...prev,
      [word]: { ...prev[word], [key]: value },
    }));
  };

  const handleFocus = (fieldId: string) => {
    fieldStart.current[fieldId] = Date.now();
  };

  const handleBlur = (fieldId: string, value: string) => {
    const start = fieldStart.current[fieldId];
    if (start) {
      const elapsed = Math.round((Date.now() - start) / 1000);
      fieldTimers.current[fieldId] = (fieldTimers.current[fieldId] ?? 0) + elapsed;
    }
    setTouched(prev => new Set(prev).add(fieldId));
    logEvent('strengths_reflection_field_blur', {
      field_id: fieldId,
      char_count: value.length,
      is_blank: value.trim().length === 0,
    });
  };

  const handleContinue = () => {
    // Log skipped/blank fields
    selectedWords.forEach(word => {
      PROMPTS.forEach(([key]) => {
        const val = fields[word][key];
        if (val.trim().length === 0) {
          logEvent('strengths_reflection_skipped', { field_id: `${word}__${key}` });
        }
      });
    });

    logEvent('strengths_reflection_complete', {
      total_time_s: Object.values(fieldTimers.current).reduce((a, b) => a + b, 0),
    });

    onComplete(fields);
  };

  return (
    <div className="sw-root">
      <div className="sw-header">
        <div className="sw-header__left">
          <span className="sw-label">STEP 2 OF 5</span>
          <h1 className="sw-title">Reflect</h1>
          <p className="sw-desc">
            For each strength, answer the two prompts. Don&apos;t edit yourself — write what comes naturally.
          </p>
        </div>
      </div>

      <div className="sr-words">
        {selectedWords.map((word, wordIndex) => (
          <div key={word} className="sr-word-block">
            <h2 className="sr-word-header">
              <span className="sr-word-num">{wordIndex + 1}.</span> {word}
            </h2>

            {PROMPTS.map(([key, label, placeholder]) => {
              const fieldId = `${word}__${key}`;
              const value = fields[word][key];
              const isTouched = touched.has(fieldId);
              const showNudge = isTouched && value.trim().length > 0 && value.trim().length < MIN_CHARS;

              return (
                <div key={key} className="sr-field">
                  <label className="sr-label" htmlFor={fieldId}>{label}</label>
                  <textarea
                    id={fieldId}
                    className="sr-textarea"
                    value={value}
                    placeholder={placeholder}
                    rows={3}
                    onChange={e => handleChange(word, key, e.target.value)}
                    onFocus={() => handleFocus(fieldId)}
                    onBlur={e => handleBlur(fieldId, e.target.value)}
                  />
                  {showNudge && (
                    <p className="sr-nudge">
                      Try to add a bit more detail — {MIN_CHARS - value.trim().length} more characters recommended.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="sw-footer sw-footer--with-back">
        <button className="sw-btn sw-btn--ghost" onClick={onBack} type="button">
          ← BACK
        </button>
        <button className="sw-btn" onClick={handleContinue} type="button">
          CONTINUE →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add `initialSelected` prop to `WordSelectionStep.tsx`**

When the user navigates back from Step 2 to Step 1, `WordSelectionStep` re-mounts and its local state resets to `[]`. To preserve selections, the component needs to accept an `initialSelected` prop.

In `src/components/strengths/WordSelectionStep.tsx`, update the `Props` interface and `useState` initializer:

```tsx
// Update Props interface — add one field:
interface Props {
  words: Word[];
  initialSelected?: string[];        // <-- add this
  onComplete: (selected: string[]) => void;
}

// Update the component signature:
export default function WordSelectionStep({ words, initialSelected = [], onComplete }: Props) {

// Update the selected state initializer:
  const [selected, setSelected] = useState<string[]>(initialSelected);
```

No other changes to `WordSelectionStep.tsx` are needed.

- [ ] **Step 5: Wire `ReflectionStep` into `StrengthsFlow.tsx`**

Add the import and replace the `step === 'reflection'` block. Also pass `initialSelected` to `WordSelectionStep`:

```tsx
// Add to imports
import ReflectionStep from './ReflectionStep';

// In the JSX, update WordSelectionStep to pass initialSelected,
// and replace the reflection placeholder:
{step === 'word-selection' && (
  <WordSelectionStep
    words={words}
    initialSelected={selectedWords}    // restores chips on back-navigation
    onComplete={selected => {
      setSelectedWords(selected);
      setStep('reflection');
    }}
  />
)}

{step === 'reflection' && (
  <ReflectionStep
    selectedWords={selectedWords}
    onComplete={data => {
      setReflections(data);
      setStep('pitch');
    }}
    onBack={() => setStep('word-selection')}
  />
)}
```

- [ ] **Step 6: Add reflection styles to `src/styles/strengths.css`**

Append:

```css
/* ─── Reflection Step ────────────────────────────────────────────────────── */

.sr-words {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.sr-word-block {
  border: 1px solid var(--color-green);
  padding: var(--space-md);
}

.sr-word-header {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  color: var(--color-gold);
  margin: 0 0 var(--space-md);
}

.sr-word-num {
  color: var(--color-blue);
}

.sr-field {
  margin-bottom: var(--space-md);
}

.sr-field:last-child {
  margin-bottom: 0;
}

.sr-label {
  display: block;
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text);
  opacity: 0.8;
  margin-bottom: var(--space-xs);
}

.sr-textarea {
  width: 100%;
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  color: var(--color-text);
  background: transparent;
  border: 1px solid var(--color-green);
  padding: var(--space-sm);
  resize: vertical;
  line-height: var(--line-height-base);
  transition: border-color steps(2);
}

.sr-textarea:focus {
  outline: none;
  border-color: var(--color-blue);
}

.sr-textarea::placeholder {
  color: var(--color-text);
  opacity: 0.35;
}

.sr-nudge {
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  color: var(--color-peach);
  margin: var(--space-xs) 0 0;
  opacity: 0.85;
}

.sw-footer--with-back {
  justify-content: space-between;
}

.sw-btn--ghost {
  border-color: var(--color-green);
  color: var(--color-green);
}

.sw-btn--ghost:hover {
  background-color: var(--color-green);
  color: var(--color-bg);
}
```

- [ ] **Step 7: Run tests**

```bash
npx playwright test tests/strengths.spec.ts -g "reflection" --reporter=line
```

Expected: all reflection tests PASS.

- [ ] **Step 8: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 9: Commit**

```bash
git add src/components/strengths/WordSelectionStep.tsx src/components/strengths/ReflectionStep.tsx src/components/strengths/StrengthsFlow.tsx src/styles/strengths.css tests/strengths.spec.ts
git commit -m "feat: add reflection step with back-navigation chip restore (Epic 2)"
```

---

## Task 3: Pitch Step (Epic 3)

**Files:**
- Create: `src/components/strengths/PitchStep.tsx`
- Modify: `src/components/strengths/StrengthsFlow.tsx`
- Modify: `src/styles/strengths.css`

- [ ] **Step 1: Write the failing Playwright test**

Add to `tests/strengths.spec.ts`:

```typescript
test.describe('Strengths flow — pitch step', () => {
  async function goToPitch(page: Page) {
    await page.goto('/strengths');
    const chips = page.locator('.sw-chip');
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
    await expect(page.getByText('4 of 5')).toBeVisible();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx playwright test tests/strengths.spec.ts -g "pitch" --reporter=line
```

Expected: FAIL.

- [ ] **Step 3: Create `PitchStep.tsx`**

```tsx
// src/components/strengths/PitchStep.tsx
import { useState, useRef } from 'react';
import { logEvent } from '../../lib/telemetry';

interface Props {
  topWord: string;
  onComplete: (pitch: string) => void;
  onBack: () => void;
}

export default function PitchStep({ topWord, onComplete, onBack }: Props) {
  const [pitch, setPitch] = useState('');
  const startedAt = useRef(Date.now());

  const handleContinue = () => {
    logEvent('strengths_pitch_complete', {
      time_s: Math.round((Date.now() - startedAt.current) / 1000),
      char_count: pitch.length,
      skipped: pitch.trim().length === 0,
    });
    onComplete(pitch);
  };

  return (
    <div className="sw-root">
      <div className="sw-header">
        <div className="sw-header__left">
          <span className="sw-label">STEP 3 OF 5</span>
          <h1 className="sw-title">Your Elevator Pitch</h1>
          <p className="sw-desc">
            Using your top strength as the foundation, describe who you are professionally in 3–5 sentences.
          </p>
        </div>
      </div>

      <div className="spi-anchor">
        <span className="spi-anchor-label">YOUR #1 STRENGTH</span>
        <span className="spi-anchor-word">{topWord}</span>
      </div>

      <div className="spi-field">
        <label className="sr-label" htmlFor="pitch-input">
          Using <em>{topWord}</em> as your foundation, describe who you are professionally in 3–5 sentences.
        </label>
        <textarea
          id="pitch-input"
          className="spi-textarea"
          value={pitch}
          rows={6}
          placeholder="I am someone who..."
          onChange={e => setPitch(e.target.value)}
        />
        <p className="spi-char-count">{pitch.length} characters</p>
      </div>

      <div className="sw-footer sw-footer--with-back">
        <button className="sw-btn sw-btn--ghost" onClick={onBack} type="button">
          ← BACK
        </button>
        <button className="sw-btn" onClick={handleContinue} type="button">
          CONTINUE →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire `PitchStep` into `StrengthsFlow.tsx`**

```tsx
// Add to imports
import PitchStep from './PitchStep';

// Add to JSX after the reflection block:
{step === 'pitch' && (
  <PitchStep
    topWord={selectedWords[0]}
    onComplete={text => {
      setPitch(text);
      setStep('pdf');
    }}
    onBack={() => setStep('reflection')}
  />
)}
```

- [ ] **Step 5: Add pitch styles to `src/styles/strengths.css`**

Append:

```css
/* ─── Pitch Step ─────────────────────────────────────────────────────────── */

.spi-anchor {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
  margin-bottom: var(--space-lg);
  padding: var(--space-md);
  border: 4px double var(--color-gold);
}

.spi-anchor-label {
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  color: var(--color-gold);
}

.spi-anchor-word {
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  color: var(--color-text);
}

.spi-field {
  margin-bottom: var(--space-lg);
}

.spi-textarea {
  width: 100%;
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  color: var(--color-text);
  background: transparent;
  border: 1px solid var(--color-green);
  padding: var(--space-sm);
  resize: vertical;
  line-height: var(--line-height-base);
  transition: border-color steps(2);
}

.spi-textarea:focus {
  outline: none;
  border-color: var(--color-blue);
}

.spi-textarea::placeholder {
  color: var(--color-text);
  opacity: 0.35;
}

.spi-char-count {
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  opacity: 0.5;
  margin: var(--space-xs) 0 0;
  text-align: right;
}
```

- [ ] **Step 6: Run tests**

```bash
npx playwright test tests/strengths.spec.ts -g "pitch" --reporter=line
```

Expected: PASS.

- [ ] **Step 7: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
git add src/components/strengths/PitchStep.tsx src/components/strengths/StrengthsFlow.tsx src/styles/strengths.css tests/strengths.spec.ts
git commit -m "feat: add elevator pitch step (Epic 3)"
```

---

## Task 4: PDF Download Step (Epic 4)

**Files:**
- Create: `src/components/strengths/PdfDownloadStep.tsx`
- Modify: `src/components/strengths/StrengthsFlow.tsx`
- Modify: `src/styles/strengths.css`

**Note:** jsPDF must already be installed from Task 0.

- [ ] **Step 1: Write the failing Playwright test**

Add to `tests/strengths.spec.ts`:

```typescript
test.describe('Strengths flow — PDF step', () => {
  async function goToPdf(page: Page) {
    await page.goto('/strengths');
    const chips = page.locator('.sw-chip');
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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx playwright test tests/strengths.spec.ts -g "PDF step" --reporter=line
```

Expected: FAIL.

- [ ] **Step 3: Create `PdfDownloadStep.tsx`**

```tsx
// src/components/strengths/PdfDownloadStep.tsx
import { useState } from 'react';
import { logEvent } from '../../lib/telemetry';
import type { Reflection } from './StrengthsFlow';

interface Props {
  selectedWords: string[];
  reflections: Record<string, Reflection>;
  pitch: string;
  onComplete: () => void;
  onBack: () => void;
}

function generatePdf(
  selectedWords: string[],
  reflections: Record<string, Reflection>,
  pitch: string,
  onError: (msg: string) => void
) {
  // Dynamic import keeps jsPDF out of the SSR bundle
  import('jspdf')
    .then(({ jsPDF }) => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const margin = 72;
    const pageWidth = 612;
    const usableWidth = pageWidth - margin * 2;
    let y = margin;

    const addLine = (text: string, size: number, isBold = false) => {
      doc.setFontSize(size);
      if (isBold) doc.setFont('helvetica', 'bold');
      else doc.setFont('helvetica', 'normal');
      // jsPDF 2.x ships its own types — splitTextToSize returns string[]
      const lines = doc.splitTextToSize(text, usableWidth);
      lines.forEach((line: string) => {
        if (y > 720) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += size * 1.5;
      });
      y += 4;
    };

    // Title
    doc.setTextColor(40, 40, 40);
    addLine('My Top Strengths', 24, true);
    y += 12;

    // Divider
    doc.setDrawColor(180, 150, 50);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;

    // Each word + reflection
    selectedWords.forEach((word, i) => {
      addLine(`${i + 1}. ${word}`, 14, true);
      const r = reflections[word];
      if (r?.why?.trim()) {
        addLine(`Why: ${r.why.trim()}`, 11);
      }
      if (r?.moment?.trim()) {
        addLine(`Moment: ${r.moment.trim()}`, 11);
      }
      y += 8;
    });

    // Divider
    y += 8;
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;

    // Pitch
    if (pitch.trim()) {
      addLine('My Elevator Pitch', 14, true);
      addLine(pitch.trim(), 11);
      y += 8;
    }

    // Closing prompt
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;
    doc.setTextColor(100, 100, 100);
    addLine('Practice this pitch daily. Refine it over time.', 10, true);

    doc.save('my-strengths.pdf');

    logEvent('strengths_pdf_downloaded');
  })
  .catch(() => {
    onError('PDF generation failed. Try downloading again or use Print instead.');
  });
}

function triggerPrint() {
  window.print();
  logEvent('strengths_pdf_printed');
}

export default function PdfDownloadStep({ selectedWords, reflections, pitch, onComplete, onBack }: Props) {
  const [pdfError, setPdfError] = useState('');

  return (
    <div className="sw-root">
      <div className="sw-header">
        <div className="sw-header__left">
          <span className="sw-label">STEP 4 OF 5</span>
          <h1 className="sw-title">Your Strengths Summary</h1>
          <p className="sw-desc">Download or print your personalized strengths PDF.</p>
        </div>
      </div>

      <div className="spdf-preview">
        <h2 className="spdf-section-title">Your Top 5 Strengths</h2>
        <ol className="spdf-words-list">
          {selectedWords.map(word => (
            <li key={word} className="spdf-word">{word}</li>
          ))}
        </ol>

        {pitch.trim() && (
          <>
            <h2 className="spdf-section-title">Your Elevator Pitch</h2>
            <p className="spdf-pitch">{pitch}</p>
          </>
        )}
      </div>

      {pdfError && <p className="spdf-error">{pdfError}</p>}

      <div className="spdf-actions">
        <button
          className="sw-btn sw-btn--primary"
          onClick={() => generatePdf(selectedWords, reflections, pitch, setPdfError)}
          type="button"
        >
          ↓ DOWNLOAD PDF
        </button>
        <button
          className="sw-btn sw-btn--ghost"
          onClick={triggerPrint}
          type="button"
        >
          ⎙ PRINT
        </button>
      </div>

      <div className="sw-footer sw-footer--with-back">
        <button className="sw-btn sw-btn--ghost" onClick={onBack} type="button">
          ← BACK
        </button>
        <button className="sw-btn" onClick={onComplete} type="button">
          CONTINUE →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire `PdfDownloadStep` into `StrengthsFlow.tsx`**

```tsx
// Add to imports
import PdfDownloadStep from './PdfDownloadStep';

// Add to JSX after the pitch block:
{step === 'pdf' && (
  <PdfDownloadStep
    selectedWords={selectedWords}
    reflections={reflections}
    pitch={pitch}
    onComplete={() => setStep('feedback')}
    onBack={() => setStep('pitch')}
  />
)}
```

- [ ] **Step 5: Add PDF step styles to `src/styles/strengths.css`**

Append:

```css
/* ─── PDF Step ───────────────────────────────────────────────────────────── */

.spdf-preview {
  border: 4px double var(--color-green);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.spdf-section-title {
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-gold);
  margin: 0 0 var(--space-sm);
}

.spdf-section-title + .spdf-section-title {
  margin-top: var(--space-lg);
}

.spdf-words-list {
  list-style: decimal;
  padding-left: 1.5rem;
  margin: 0 0 var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.spdf-word {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.spdf-pitch {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  color: var(--color-text);
  line-height: var(--line-height-base);
  margin: 0;
}

.spdf-actions {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.spdf-error {
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  color: var(--color-peach);
  margin: 0 0 var(--space-md);
}

@media (max-width: 600px) {
  .spdf-actions {
    flex-direction: column;
  }
}
```

- [ ] **Step 6: Run tests**

```bash
npx playwright test tests/strengths.spec.ts -g "PDF step" --reporter=line
```

Expected: PASS.

- [ ] **Step 7: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
git add src/components/strengths/PdfDownloadStep.tsx src/components/strengths/StrengthsFlow.tsx src/styles/strengths.css tests/strengths.spec.ts
git commit -m "feat: add PDF download step with jsPDF (Epic 4)"
```

---

## Task 5: Feedback Survey (Epic 5)

**Files:**
- Create: `src/components/strengths/FeedbackStep.tsx`
- Modify: `src/components/strengths/StrengthsFlow.tsx`
- Modify: `src/styles/strengths.css`

- [ ] **Step 1: Write the failing Playwright test**

Add to `tests/strengths.spec.ts`:

```typescript
test.describe('Strengths flow — feedback step', () => {
  async function goToFeedback(page: Page) {
    await page.goto('/strengths');
    const chips = page.locator('.sw-chip');
    for (let i = 0; i < 5; i++) {
      await chips.nth(i).click();
    }
    // word selection → reflection → pitch → pdf → feedback
    for (let i = 0; i < 4; i++) {
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
    await page.locator('.sfb-rating-btn').nth(3).click(); // rating 4
    await page.getByRole('button', { name: /SUBMIT/i }).click();
    await expect(page.locator('.sfb-complete')).toBeVisible();
  });

  test('skip also shows completion state', async ({ page }) => {
    await goToFeedback(page);
    await page.getByRole('button', { name: /SKIP/i }).click();
    await expect(page.locator('.sfb-complete')).toBeVisible();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx playwright test tests/strengths.spec.ts -g "feedback" --reporter=line
```

Expected: FAIL.

- [ ] **Step 3: Create `FeedbackStep.tsx`**

```tsx
// src/components/strengths/FeedbackStep.tsx
import { useState } from 'react';
import { logEvent } from '../../lib/telemetry';

interface Props {
  onComplete: () => void;
}

export default function FeedbackStep({ onComplete }: Props) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    logEvent('strengths_feedback_submitted', {
      rating: rating ?? 0,
      has_comment: comment.trim().length > 0,
    });
    setSubmitted(true);
  };

  const handleSkip = () => {
    logEvent('strengths_feedback_skipped');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="sw-root">
        <div className="sfb-complete">
          <p className="sfb-complete__title">You&apos;re done.</p>
          <p className="sfb-complete__sub">
            Your strengths PDF is ready to practice from. Revisit this exercise in 6 months — your answers will change.
          </p>
          <button className="sw-btn" onClick={onComplete} type="button">
            START OVER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sw-root">
      <div className="sw-header">
        <div className="sw-header__left">
          <span className="sw-label">STEP 5 OF 5</span>
          <h1 className="sw-title">One Last Thing</h1>
          <p className="sw-desc">Optional — takes 10 seconds. Helps improve this tool.</p>
        </div>
      </div>

      <div className="sfb-questions">
        <div className="sfb-question">
          <p className="sfb-question-label">Did this exercise help clarify your strengths?</p>
          <div className="sfb-rating">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                className={`sfb-rating-btn${rating === n ? ' sfb-rating-btn--selected' : ''}`}
                onClick={() => setRating(n)}
                type="button"
                aria-pressed={rating === n}
              >
                {n}
              </button>
            ))}
            <span className="sfb-rating-labels">
              <span>Not really</span>
              <span>Very much</span>
            </span>
          </div>
        </div>

        <div className="sfb-question">
          <label className="sfb-question-label" htmlFor="sfb-comment">
            What was most useful? <span className="sfb-optional">(optional)</span>
          </label>
          <textarea
            id="sfb-comment"
            className="sfb-textarea"
            value={comment}
            rows={3}
            placeholder="The part that helped me most was..."
            onChange={e => setComment(e.target.value)}
          />
        </div>
      </div>

      <div className="sw-footer sw-footer--with-back">
        <button className="sw-btn sw-btn--ghost" onClick={handleSkip} type="button">
          SKIP
        </button>
        <button className="sw-btn" onClick={handleSubmit} type="button">
          SUBMIT
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire `FeedbackStep` into `StrengthsFlow.tsx`**

```tsx
// Add to imports
import FeedbackStep from './FeedbackStep';

// Add to JSX after the pdf block:
{step === 'feedback' && (
  <FeedbackStep onComplete={handleRestart} />
)}
```

- [ ] **Step 5: Add feedback styles to `src/styles/strengths.css`**

Append:

```css
/* ─── Feedback Step ──────────────────────────────────────────────────────── */

.sfb-questions {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.sfb-question-label {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  color: var(--color-text);
  margin: 0 0 var(--space-sm);
  display: block;
}

.sfb-optional {
  color: var(--color-text);
  opacity: 0.5;
  font-size: var(--font-size-sm);
}

.sfb-rating {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-xs);
}

.sfb-rating-btn {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  font-weight: bold;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--color-green);
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition: background-color steps(2), border-color steps(2);
}

.sfb-rating-btn:hover {
  border-color: var(--color-blue);
  color: var(--color-blue);
}

.sfb-rating-btn--selected {
  border: 2px solid var(--color-gold);
  color: var(--color-gold);
  background-color: rgba(212, 175, 55, 0.08);
}

.sfb-rating-labels {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  opacity: 0.5;
  width: 14rem;
  margin-left: var(--space-sm);
}

.sfb-textarea {
  width: 100%;
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  color: var(--color-text);
  background: transparent;
  border: 1px solid var(--color-green);
  padding: var(--space-sm);
  resize: vertical;
  line-height: var(--line-height-base);
}

.sfb-textarea:focus {
  outline: none;
  border-color: var(--color-blue);
}

.sfb-textarea::placeholder {
  color: var(--color-text);
  opacity: 0.35;
}

/* ─── Completion screen ──────────────────────────────────────────────────── */

.sfb-complete {
  max-width: 40rem;
  margin: var(--space-xl) auto;
  border: 4px double var(--color-gold);
  padding: var(--space-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  align-items: center;
}

.sfb-complete__title {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  color: var(--color-gold);
  margin: 0;
}

.sfb-complete__sub {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  color: var(--color-text);
  opacity: 0.8;
  margin: 0;
}
```

- [ ] **Step 6: Run tests**

```bash
npx playwright test tests/strengths.spec.ts -g "feedback" --reporter=line
```

Expected: PASS.

- [ ] **Step 7: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 8: Commit**

```bash
git add src/components/strengths/FeedbackStep.tsx src/components/strengths/StrengthsFlow.tsx src/styles/strengths.css tests/strengths.spec.ts
git commit -m "feat: add feedback survey step (Epic 5)"
```

---

## Task 6: Flow Infrastructure — Full E2E Test + Build Verification

**Wire up remaining Epic 6 items and verify the full flow end-to-end.**

**Files:**
- Modify: `tests/strengths.spec.ts`

- [ ] **Step 1: Write full flow E2E test**

Add to `tests/strengths.spec.ts`:

```typescript
test.describe('Strengths flow — full journey', () => {
  test('completes the full 5-step flow without errors', async ({ page }) => {
    await page.goto('/strengths');

    // Step 1: select 5 words
    const chips = page.locator('.sw-chip');
    for (let i = 0; i < 5; i++) {
      await chips.nth(i).click();
    }
    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await expect(page.getByText('2 of 5')).toBeVisible();

    // Step 2: reflection — click continue without filling fields
    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await expect(page.getByText('3 of 5')).toBeVisible();

    // Step 3: pitch — skip
    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await expect(page.getByText('4 of 5')).toBeVisible();

    // Step 4: pdf — continue
    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await expect(page.getByText('5 of 5')).toBeVisible();

    // Step 5: feedback — skip
    await page.getByRole('button', { name: /SKIP/i }).click();
    await expect(page.locator('.sfb-complete')).toBeVisible();
  });

  test('back navigation from step 2 returns to step 1 with chips still selected', async ({ page }) => {
    await page.goto('/strengths');
    const chips = page.locator('.sw-chip');
    for (let i = 0; i < 5; i++) {
      await chips.nth(i).click();
    }
    await page.getByRole('button', { name: /CONTINUE/i }).click();
    await expect(page.getByText('2 of 5')).toBeVisible();

    await page.getByRole('button', { name: /BACK/i }).click();
    await expect(page.getByText('1 of 5')).toBeVisible();
    // Chips should still be selected after back-navigation
    await expect(page.locator('.sw-chip--selected')).toHaveCount(5);
  });

  test('back navigation from step 3 returns to step 2', async ({ page }) => {
    await page.goto('/strengths');
    const chips = page.locator('.sw-chip');
    for (let i = 0; i < 5; i++) {
      await chips.nth(i).click();
    }
    await page.getByRole('button', { name: /CONTINUE/i }).click(); // → step 2
    await page.getByRole('button', { name: /CONTINUE/i }).click(); // → step 3
    await expect(page.getByText('3 of 5')).toBeVisible();

    await page.getByRole('button', { name: /BACK/i }).click();
    await expect(page.getByText('2 of 5')).toBeVisible();
  });

  test('back navigation from step 4 returns to step 3', async ({ page }) => {
    await page.goto('/strengths');
    const chips = page.locator('.sw-chip');
    for (let i = 0; i < 5; i++) {
      await chips.nth(i).click();
    }
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: /CONTINUE/i }).click();
    }
    await expect(page.getByText('4 of 5')).toBeVisible();

    await page.getByRole('button', { name: /BACK/i }).click();
    await expect(page.getByText('3 of 5')).toBeVisible();
  });

  test('START OVER from completion screen resets to step 1', async ({ page }) => {
    await page.goto('/strengths');
    const chips = page.locator('.sw-chip');
    for (let i = 0; i < 5; i++) {
      await chips.nth(i).click();
    }
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: /CONTINUE/i }).click();
    }
    await page.getByRole('button', { name: /SKIP/i }).click();
    await expect(page.locator('.sfb-complete')).toBeVisible();

    await page.getByRole('button', { name: /START OVER/i }).click();
    await expect(page.getByText('1 of 5')).toBeVisible();
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
```

- [ ] **Step 2: Run full test suite**

```bash
npx playwright test tests/strengths.spec.ts --reporter=line
```

Expected: all tests PASS.

- [ ] **Step 3: Run full build**

```bash
npx astro build
```

Expected: build completes with no errors or warnings.

- [ ] **Step 4: Run full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Run existing tests to confirm no regressions**

```bash
npx playwright test --reporter=line
```

Expected: all existing tests continue to PASS.

- [ ] **Step 6: Final commit**

```bash
git add tests/strengths.spec.ts
git commit -m "test: add full E2E flow tests for strengths identifier"
```

---

## Execution Order Summary

| Task | Epic | Key Risk |
|------|------|----------|
| 0 | 4 (spike) | jsPDF compatibility — must pass before Task 4 |
| 1 | 6 (state) | Flow state model — all other tasks depend on this |
| 2 | 2 | Reflection UI |
| 3 | 3 | Pitch UI |
| 4 | 4 | PDF generation |
| 5 | 5 | Feedback survey |
| 6 | 6 | Full E2E verification |
