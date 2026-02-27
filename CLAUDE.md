# CLAUDE.md — Personal Website

## Project Overview

This is a personal website for a business and strategy professional. The primary audience is people who already know the owner — they arrive with a name or business card and are looking to confirm credibility and take the next step toward working together.

**Primary goal of the site:** Convert a warm visitor into a conversation (inquiry, hire, collaboration).

---

## Tech Stack

- **Framework:** Astro — content-first, ships minimal JavaScript, fits the static/low-JS aesthetic
- **Language:** TypeScript (strict mode)
- **Styling:** CSS — prefer vanilla CSS custom properties over utility frameworks; keep it close to the metal
- **Testing:** Playwright (E2E)
- **Package manager:** npm (default unless changed)
- **Hosting:** TBD (keep deployment config flexible; avoid platform-specific lock-in where possible)

> If a new dependency is being considered, flag it and explain the tradeoff before adding it. Prefer fewer, well-chosen dependencies.

---

## Design Aesthetic

**Concept name:** "Terminal Deco" — Art Deco elegance rendered through the lens of '90s digital aesthetics. The reference document calls this "Summit & Script."

**Inspiration:** Berkshire Hathaway corporate site meets early '90s web — the *spirit* of both, not literal execution of either. Think: the structural authority of BRK.com crossed with the stark, text-forward feel of Web 1.0. Art Deco geometry (upward-reaching, symmetrical, framed) filtered through ASCII/terminal culture.

**Core principles:**
- Dark background site — base is deep forest green, not white or light grey
- Typography-led — hierarchy through type, not decoration
- No hero images, no carousels, no animations unless they serve a clear purpose
- Content loads fast and reads well with no JavaScript if possible
- Wide gutters, symmetrical alignment — characteristic of Art Deco posters and early HTML table layouts
- Mobile-first responsive layout

**Visual system — what to embrace:**
- Art Deco double-line borders as the primary frame (`border: 4px double`)
- Geometric corner accent decorations at container corners
- ASCII art for decorative elements (mountain ranges, dividers, logo areas)
- Block element characters (█, ▓, ▒, ░) for iconography and dithered gradients
- Decorative dividers using Unicode box-drawing characters (e.g. `━━━━ ❈ ━━━━`)
- CRT scanline effect via a subtle `::before` pseudo-element overlay
- Stepped transitions (`transition: steps(4)`) — intentionally non-smooth for the terminal feel
- Monospace type everywhere except display headings
- Link underlines preserved — do not strip them globally
- Stark contrast; no softening with shadows or blur
- The feel of a document, not a product landing page

**What to avoid:**
- Trendy design patterns that will feel dated in 2 years
- Gradients or drop shadows used decoratively (scanlines are structural, not decorative)
- Anything that feels like a portfolio template
- The *bad* parts of the '90s web: garish colors, blinking text, clip art, busy backgrounds
- Light or white backgrounds

---

## Color Palette — CONFIRMED

All values are locked. Do not use hardcoded hex values in component or page files — always reference the CSS custom property.

| Custom Property | Hex | Role |
|---|---|---|
| `--color-bg` | `#1B3022` | Page background (deep forest green) |
| `--color-green` | `#4F772D` | Primary brand green (mountain slopes) |
| `--color-blue` | `#8EA8C3` | Accent — alpine sky (muted blue-grey) |
| `--color-peach` | `#E29578` | Accent — sunset peak (warm terracotta) |
| `--color-gold` | `#D4AF37` | Deco accent — borders, corner details |
| `--color-text` | `#E5E5E5` | Primary text (off-white / "ascii-white") |

---

## Typography — CONFIRMED

Fonts are loaded via Google Fonts. This is an approved external dependency (adds one render-blocking request; self-hosting is an option if performance warrants it later).

| Role | Font | Source |
|---|---|---|
| Display / headlines | Archivo Black | Google Fonts |
| Monospace accent / UI | Major Mono Display | Google Fonts |
| Body / default | Courier New, Courier, monospace | System fallback |

**Usage rules:**
- Archivo Black: large headlines and name treatment only
- Major Mono Display: subtitles, labels, footer text, nav accents
- Courier New: all body copy and general UI text
- Text shadow stacking is on the table for display headings (Art Deco layered depth effect)
- `text-transform: uppercase` with wide `letter-spacing` for Major Mono Display contexts

---

## Site Structure (v1)

Only these pages ship at launch:

| Route | Purpose |
|---|---|
| `/` | Home — brief statement of who this person is and what they do |
| `/about` | Expanded bio — background, expertise, what makes this person worth hiring |
| `/work` | Work / portfolio — past roles, projects, or engagements (format TBD by owner) |
| `/contact` | Contact — simple, direct form or contact instructions |

A `/writing` route may be added in a future version. Do not scaffold it at launch.

---

## Tone & Copy

- **Voice:** Warm but professional — approachable without being casual, credible without being stiff
- **Style:** Direct sentences. No jargon. No buzzwords. Let the work speak.
- **Length:** Short. Visitors already know this person; they don't need a full pitch.

**Copy workflow:**
1. Claude may draft or suggest copy
2. All copy requires explicit owner approval before it is considered final
3. Never mark a content task complete without owner sign-off on the words

---

## Test-Driven Development

**Approach:** Pragmatic TDD using Playwright.

**Rules:**
- Every feature must have at least one Playwright test before it is considered done
- Tests do not need to be written strictly before implementation (red-green-refactor is encouraged but not mandated)
- No feature ships without passing tests
- Critical paths that must always be covered:
  - All pages load without errors
  - Navigation links work correctly
  - Contact form renders and submits (or shows appropriate error)
  - Site is accessible (basic a11y checks via Playwright)

**Test file location:** `tests/` at project root

**Running tests:**
```bash
npx playwright test
```

**Before marking any task done, confirm:**
- [ ] Tests exist for the feature
- [ ] All tests pass (`npx playwright test`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)

---

## Code Conventions

- TypeScript strict mode — no `any` without a comment explaining why
- No unused variables or imports
- Component files go in `src/components/`
- Page files go in `src/pages/`
- Shared styles go in `src/styles/`
- Keep components small and single-purpose
- Prefer readability over cleverness

---

## Claude Behavior Rules

1. **Read before editing.** Always read a file before modifying it.
2. **Minimal changes.** Only change what is necessary for the task. Do not refactor surrounding code unless asked.
3. **No speculative features.** Do not add functionality beyond what was explicitly requested.
4. **Copy requires approval.** Suggest copy, but never treat it as final without owner confirmation.
5. **Flag dependencies.** Before adding any npm package, state what it does and why it's needed.
6. **Ask before destructive actions.** Deleting files, clearing content, or structural changes to the site require confirmation.
7. **Tests gate completion.** A feature is not done until its Playwright test passes.
8. **Stack consistency.** Do not introduce a new framework, library, or tool without explicit discussion.

---

## Decisions Made

These were open questions that have been explicitly resolved by the owner. Do not re-open them without a good reason.

| Decision | Resolution |
|---|---|
| Mobile navigation | Hamburger toggle menu — nav collapses at < 768px, toggle button shows/hides |
| Color palette — direction | Cool greens — locked |
| Color palette — specific values | All 6 values confirmed — see Color Palette section above |
| Design aesthetic | "Terminal Deco" — Art Deco geometry through a '90s terminal lens; dark bg; see Design Aesthetic section |
| Typeface — display | Archivo Black via Google Fonts |
| Typeface — accent/UI | Major Mono Display via Google Fonts |
| Typeface — body | Courier New (system monospace) |
| Google Fonts dependency | Approved — Archivo Black + Major Mono Display |
| Background color | Dark site — `--color-bg` (#1B3022) as page background |

---

## Out of Scope (for now)

- Blog / writing section
- CMS integration
- Authentication
- Analytics (add later, privacy-consciously)
- Dark mode (can revisit)
- Internationalization
