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

**Inspiration:** Berkshire Hathaway corporate site — the *spirit*, not the literal execution.

**Core principles:**
- Old-school shell with modern internals: looks restrained and timeless at a glance, but has clean contemporary UX patterns underneath
- Typography-led — hierarchy through type, not decoration
- No hero images, no carousels, no animations unless they serve a clear purpose
- Content loads fast and reads well with no JavaScript if possible
- White space is intentional, not an accident
- Mobile-first responsive layout

**What to avoid:**
- Trendy design patterns that will feel dated in 2 years
- Gradients, drop shadows, or effects used decoratively
- Anything that feels like a portfolio template

**Color palette:** To be defined by the owner. Do not introduce colors without explicit approval. Use CSS custom properties (`--color-*`) so the palette can be swapped cleanly.

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

## Out of Scope (for now)

- Blog / writing section
- CMS integration
- Authentication
- Analytics (add later, privacy-consciously)
- Dark mode (can revisit)
- Internationalization
