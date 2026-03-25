# Project Plan & TODOs

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done · `[-]` skipped/deferred

---

# Main Page

## Phase 6 — Post-Launch (Backlog)

- [ ] Add analytics (privacy-conscious — Fathom, Plausible, or similar)
- [ ] Add `/writing` blog section
- [ ] Consider dark mode
- [ ] Set up uptime monitoring
- [ ] Schedule periodic content review (quarterly)

---

## Strengths Identifier — `/strengths`

### Completed (branch: `feature/strengths-epics-2-6`, merged via PR #1)

Epics 1–6 merged to main via PR #1. 29 Playwright tests.

- [x] Epic 1 — Word Selection Step (200 words from CSV, 5-minute timer, select exactly 5)
- [x] Epic 2 — Reflection Step (2 prompts per word, soft character nudge, back-nav)
- [x] Epic 3 — Elevator Pitch Step (textarea with char count, #1 strength anchor)
- [x] Epic 4 — PDF Download Step (jsPDF client-side generation, print fallback)
- [x] Epic 5 — Feedback Survey (1–5 rating, optional text, completion screen)
- [x] Epic 6 — Flow Infrastructure (5-step progress bar, back-nav, restart, full E2E tests)

### Completed: Word Grid Redesign + Theme + Reorder + Pitches (merged via PR #4)

Full redesign merged to main via PR #4. 127 Playwright tests (57 main + 70 strengths).

- [x] Selection Island component (sticky, 5 slots, progress bar) — ATR-32
- [x] Checkbox toggle state on word buttons (☐/☑ + fill + weight) — ATR-34
- [x] Definition Preview Bar component (hover/long-press to see definition) — ATR-35
- [x] At-max dimming with hover-still-active behavior — ATR-36
- [x] DefinitionProvider abstraction (swappable display strategy) — ATR-37
- [x] Resize word buttons — bigger with larger text — ATR-15
- [x] Rewrite word grid to CSS grid with 4 columns — ATR-16
- [x] Remove rank-ordering of selected words — ATR-17
- [x] New page theme (clean dark, not Terminal Deco) — ATR-5, ATR-11, ATR-12, ATR-13, ATR-14
- [x] Word reordering via move-up/move-down buttons — ATR-18
- [x] Mobile responsiveness tests (375px, 768px) — ATR-19
- [x] Elevator pitch examples (3 collapsible, draft copy pending owner approval) — ATR-22, ATR-23, ATR-24
- [x] Merge `feature/strengths-redesign` → `main` via PR #4 — ATR-30

### Pending: Cleanup

- [ ] Remove worktree after merge — ATR-31

### Completed: Polish Pass (branch: `feature/strengths-polish`)

- [x] Enlarge word buttons — font-size 1.3rem, padding 1.4rem, min-height 74px — ATR-43
- [x] Replace hardcoded `border-radius: 8px` on `.spi-example` with `var(--st-radius)` — ATR-39
- [x] Increase reorder button touch targets to 44px minimum — ATR-40
- [x] Add `focus-visible` outlines to reorder buttons — ATR-41
- [x] Refactor mobile reorder test to use `test.use({ viewport })` — ATR-42

### Pending: Strengths Page — remaining work

#### S2 — Word selection layout — remaining
- [ ] Implement travel animation (ghost copy from grid to island) — ATR-33

#### S3 — Definition hover (NEEDS DECISION) — ATR-7
- [x] Definition Preview Bar built and working — ATR-35
- [x] DefinitionProvider abstraction created — ATR-37
- [ ] Prototype 2–3 tooltip/hover options for owner decision — ATR-20
- [ ] Accessibility review of chosen tooltip approach — ATR-21
- [ ] Code review: swappable definition architecture — ATR-38

#### S4 — Elevator pitch examples — remaining
- [ ] Owner approval on draft pitch example copy (3 examples in PitchStep.tsx)

#### S5 — General polish — ATR-9 [Backlog]
- [ ] Review all step transitions for smoothness — ATR-25
- [ ] Mobile UX pass with new button sizing — ATR-26
- [ ] Accessibility pass on new theme (contrast ratios, focus states) — ATR-27
- [ ] Update full E2E test suite for redesigned flow — ATR-28
- [ ] Final code review before merge — ATR-29

---

## Decisions Pending Owner Input

| # | Decision | Notes |
|---|---|---|
| 3 | Strengths: definition hover | Show word definition on hover/tooltip? Owner undecided (ATR-7) |

## Decisions Resolved

| Decision | Resolution |
|---|---|
| Mobile navigation pattern | Hamburger toggle at < 768px — implemented and tested |
| Design aesthetic direction | "Terminal Deco" — Art Deco geometry + '90s terminal aesthetic; dark bg |
| Color palette — all values | Confirmed — 6 custom properties locked in CLAUDE.md |
| Typeface — display | Archivo Black (Google Fonts) |
| Typeface — accent/UI | Major Mono Display (Google Fonts) |
| Typeface — body | Courier New (system monospace) |
| Background treatment | Dark site — deep forest green (#1B3022) base |
| Work page format | Roles with bullet-point accomplishments + separate Advisory/Projects section |
| Contact method | Email + LinkedIn link (no form) |
| Photo | Text-only site — no headshot at launch |
| Strengths: page theme | NOT Terminal Deco — needs its own clean white/dark theme (2026-03-20) |
| Strengths: button layout | Rows of 4, bigger buttons, bigger text (2026-03-20) — implemented ATR-15,16 |
| Strengths: word ordering | NOT rank-ordered by selection; allow reordering (2026-03-20) — implemented ATR-17 |
| Strengths: pitch examples | Show 2–3 examples on the pitch step (2026-03-20) |
| Strengths: branch consolidation | Canonical branch is `feature/strengths-redesign`; old worktree cleaned up (2026-03-23) |
