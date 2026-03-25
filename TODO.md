# Project Plan & TODOs

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done · `[-]` skipped/deferred

---

# Main Page

## Post-Launch (Backlog)

- [ ] Add analytics (privacy-conscious — Fathom, Plausible, or similar)
- [ ] Add `/writing` blog section
- [ ] Set up uptime monitoring
- [ ] Schedule periodic content review (quarterly)

---

## Strengths Identifier — `/strengths`

### Completed

All core epics, redesign, polish, and animation work merged to main. 76 Playwright tests.

**Epics 1–6** (PR #1):
- [x] Word Selection Step, Reflection Step, Elevator Pitch Step, PDF Download, Feedback Survey, Flow Infrastructure

**Word Grid Redesign + Theme** (PR #4):
- [x] Selection Island, checkbox toggle, definition tooltip, at-max dimming — ATR-32, ATR-34, ATR-35, ATR-36
- [x] CSS grid layout, bigger buttons, reordering, mobile tests — ATR-15, ATR-16, ATR-17, ATR-18, ATR-19
- [x] Clean dark theme (not Terminal Deco) — ATR-5, ATR-11, ATR-12, ATR-13, ATR-14
- [x] Elevator pitch examples — ATR-22, ATR-23, ATR-24
- [x] Merge & cleanup — ATR-10, ATR-30, ATR-31

**Polish Pass** (PR #5):
- [x] Enlarge word buttons, fix border-radius, reorder touch targets, focus outlines, test refactor — ATR-39–43

**Travel Animation** (PR #6):
- [x] Ghost chip fly-to-island animation — ATR-33
- [x] E2E test suite updated (76 tests) — ATR-28

### Remaining Work

#### S3 — Definition hover — ATR-7 [Done]
- [x] Floating tooltip shipped (hover on desktop, tap on mobile) — ATR-20
- [x] DefinitionProvider built, validated, then inlined — ATR-37, ATR-38
- [x] Accessibility review of tooltip (keyboard nav, screen reader, touch) — ATR-21

#### S4 — Elevator pitch examples
- [ ] Owner approval on draft pitch example copy
  - **Where to edit:** `src/components/strengths/PitchStep.tsx` lines 5–21, the `PITCH_EXAMPLES` array
  - Three drafts: "The Connector", "The Strategist", "The Builder" — update the `title` and `text` fields

#### S5 — General polish — ATR-9 [Done]
- [x] Review all step transitions for smoothness — ATR-25
- [x] Mobile UX pass with new button sizing — ATR-26
- [x] Accessibility pass on new theme (contrast ratios, focus states) — ATR-27
- [x] Final code review before merge — ATR-29

---

## Decisions Pending Owner Input

| # | Decision | Notes |
|---|---|---|
| 1 | Pitch example copy | Owner approval needed on 3 draft examples in PitchStep.tsx |

## Decisions Resolved

| Decision | Resolution |
|---|---|
| Mobile navigation pattern | Hamburger toggle at < 768px |
| Design aesthetic direction | "Terminal Deco" — Art Deco geometry + '90s terminal aesthetic; dark bg |
| Color palette | 6 custom properties locked in CLAUDE.md |
| Typeface — display | Archivo Black (self-hosted woff2) |
| Typeface — body | Courier New (system monospace) |
| Background treatment | Dark site — deep forest green (#1B3022) |
| Work page format | Roles with bullet-point accomplishments + Advisory/Projects section |
| Contact method | Email + LinkedIn link (no form) |
| Photo | Text-only site — no headshot |
| Strengths: page theme | Clean dark theme, not Terminal Deco |
| Strengths: button layout | Rows of 4, bigger buttons, bigger text |
| Strengths: word ordering | Not rank-ordered; reordering via move buttons |
| Strengths: pitch examples | Show 2–3 collapsible examples on pitch step |
| Strengths: definition hover | Floating tooltip (hover/tap) — shipped, a11y review pending |
