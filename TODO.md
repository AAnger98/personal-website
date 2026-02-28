# Project Plan & TODOs

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done · `[-]` skipped/deferred

---

## Phase 1 — Project Setup & Infrastructure

### 1.1 Tooling & Environment
- [x] Initialize Astro project (`npm create astro@latest`)
- [x] Configure TypeScript strict mode (`tsconfig.json`)
- [x] Set up Prettier with agreed-upon config
- [x] Set up ESLint for TypeScript + Astro
- [x] Add `.gitignore` (node_modules, dist, .env, playwright artifacts)
- [x] Initialize git repository
- [x] Create initial commit

### 1.2 Testing Infrastructure
- [x] Install and configure Playwright (`npm init playwright@latest`)
- [x] Write a smoke test: home page returns 200 and has a `<title>`
- [x] Confirm `npx playwright test` runs and passes
- [x] Add test script to `package.json`
- [x] Document how to run tests in README

### 1.3 Project Structure
- [x] Establish folder structure (`src/components/`, `src/pages/`, `src/styles/`, `tests/`)
- [x] Create base layout component (`src/layouts/BaseLayout.astro`)
- [x] Create site config file (`src/config.ts`) for name, tagline, nav links, contact info

---

## Phase 2 — Design System & Foundations

### 2.1 CSS Foundation
- [x] Define CSS custom properties for color palette (owner to provide values)
- [x] Define typography scale (font sizes, line heights, weights)
- [x] Choose and load typeface(s) — using system font stack; owner to confirm or swap
- [x] Define spacing scale (margin/padding tokens)
- [x] Write global reset / base styles
- [x] **Update CSS custom properties with confirmed palette values** (see CLAUDE.md Color Palette)
- [x] **Load Google Fonts** — Archivo Black + Major Mono Display (via `<link>` in BaseLayout)
- [x] **Apply dark background** — set `--color-bg` (#1B3022) as `body` background; update text defaults
- [x] Confirm styles look correct on mobile, tablet, desktop

### 2.3 Terminal Deco Visual System
- [x] Build Art Deco double-border frame component or mixin — `DecoBorder.astro` (4px double `--color-gold`)
- [x] Build geometric corner accent decoration — ◆ corners in `DecoBorder.astro`
- [x] Build CRT scanline overlay — `::before` pseudo-element on `.page-wrapper`
- [x] Define ASCII divider pattern (`━━━━━ ❈ ━━━━━`) — `AsciiDivider.astro`
- [x] Define nav button style — double-border treatment with stepped hover transition (`steps(4)`)
- [-] Document block element icon usage (█ ▓ ▒ ░) — deferred; no current usage to document
- [x] Write Playwright test: page has dark background (computed bg color matches `--color-bg`)

### 2.2 Core Components
- [x] Build `<Header>` component with site name and navigation
- [x] Build `<Footer>` component with minimal info (name, year, optional links)
- [x] Build `<PageTitle>` component for consistent heading style across pages
- [x] Write Playwright tests for Header (nav links present and correct)
- [x] Write Playwright tests for Footer (renders, no broken links)

---

## Phase 3 — Page Development (TDD: test → build → pass)

### 3.1 Home Page (`/`)
- [x] Write Playwright test: page loads, has headline, has CTA link
- [x] Draft copy: one-line positioning statement (owner to approve)
- [x] Draft copy: 2–3 sentence intro (owner to approve)
- [x] Build home page layout
- [x] Add clear CTA linking to `/contact`
- [x] Confirm Playwright test passes

### 3.2 About Page (`/about`)
- [x] Write Playwright test: page loads, has heading, has body content
- [x] Draft copy: background, expertise, what makes you worth hiring (owner to approve)
- [x] Build about page layout
- [x] Confirm Playwright test passes

### 3.3 Work Page (`/work`)
- [~] Decide format with owner: roles list implemented; owner to confirm or request different format
- [x] Write Playwright test: page loads, has at least one work entry
- [x] Draft work entries (owner to approve)
- [x] Build work page layout
- [x] Confirm Playwright test passes

### 3.4 Contact Page (`/contact`)
- [~] Decide contact method with owner: mailto link implemented; owner to confirm or request form
- [x] Write Playwright test: page loads, contact method is visible and functional
- [x] Build contact page layout
- [x] Confirm all Contact tests pass

---

## Phase 4 — Accessibility & Quality

### 4.1 Accessibility
- [x] Add `lang` attribute to `<html>`
- [-] Ensure all images have `alt` text — no images on site at launch
- [x] Verify heading hierarchy is correct on all pages (h1 → h2 → h3)
- [ ] Check color contrast ratios meet WCAG AA — manual / post-deploy Lighthouse
- [ ] Confirm keyboard navigation works across all pages — manual testing
- [x] Add skip-to-content link

### 4.2 Performance
- [-] Deferred — moved to Phase 5.2 (requires production deploy and real domain)

### 4.3 SEO & Meta
- [x] Add `<meta>` description to every page
- [x] Add Open Graph tags (title, description, image) for link previews
- [x] Add `<link rel="canonical">` tags
- [x] Create `robots.txt`
- [x] Create `sitemap.xml` (via @astrojs/sitemap — generated at build time)

---

## Phase 4.5 — Content Population

### Pre-session: what you need to have ready
- [ ] Resume finalized and ready to share
- [ ] Real name confirmed (for `config.ts` and home page title)
- [ ] Real email confirmed (for `config.ts` and contact page)
- [ ] LinkedIn URL — captured: `https://www.linkedin.com/in/adam-angerami/`
- [ ] Domain name decided (needed to replace placeholder `siteUrl` in `config.ts` and `robots.txt`)
- [ ] List of roles to include — with notes on which need to be anonymized
- [ ] List of advisory/project entries to include (if any)

### Session — Config & wiring
- [ ] Update `config.ts`: real name, email, tagline, `siteUrl`, site `description`
- [ ] Add LinkedIn URL field to `config.ts` (used by contact page and footer)
- [ ] Update `robots.txt` sitemap URL once domain is set

### Session — Code changes (structure, not copy)
- [ ] Update Work page entry data structure to support bullet-point accomplishments
- [ ] Update Work page template to render accomplishment bullets
- [ ] Add Advisory / Projects section below roles on Work page
- [ ] Add LinkedIn link to Contact page alongside email
- [ ] Update Playwright tests for structural changes to Work and Contact pages

### Session — Copy: Home page
- [ ] Write tagline (1-line positioning statement — gold uppercase under name)
- [ ] Write intro paragraph (2–3 sentences — who you are and what you bring)
- [ ] Update home page `PageTitle` from "Your Name" to real name
- [ ] Write home meta description (SEO)
- [ ] **Owner approval: home copy**

### Session — Copy: About page
- [ ] Write Background section (career arc, domains — tech / finance / consumer)
- [ ] Write Expertise section (what problems you solve as a strategist / advisor)
- [ ] Write "Why work together" section (honest paragraph, no jargon)
- [ ] Write about meta description (SEO)
- [ ] **Owner approval: about copy**

### Session — Copy: Work page
- [ ] Write each role entry: title, org, period, 2–4 bullet accomplishments
- [ ] Flag and anonymize any sensitive entries (confidential client treatment)
- [ ] Write each Advisory / Projects entry: title, org/context, period, brief description
- [ ] Decide final cut — curated highlights vs. full history
- [ ] Write work meta description (SEO)
- [ ] **Owner approval: work copy**

### Session — Copy: Contact page
- [ ] Write contact intro copy (1–2 sentences above the links)
- [ ] Write contact meta description (SEO)
- [ ] **Owner approval: contact copy**

### Post-session review
- [ ] Read every page out loud — check for typos and awkward phrasing
- [ ] Verify name appears consistently everywhere (header, footer, page titles, OG tags)
- [ ] Run full Playwright test suite — confirm all tests pass
- [ ] Commit all content changes

---

## Phase 5 — Pre-Launch

### 5.1 Domain & Hosting
- [ ] Choose and register domain name
- [ ] Choose hosting platform (Vercel / Netlify / GitHub Pages)
- [ ] Configure deployment pipeline (push to main → auto deploy)
- [ ] Point domain DNS to host
- [ ] Confirm HTTPS is active

### 5.2 Final Review (includes deferred Phase 4.2 performance items)
- [ ] Audit with Lighthouse: target 95+ on Performance, Accessibility, Best Practices, SEO
- [ ] Verify fast load on mobile (throttled connection)
- [ ] Check color contrast ratios meet WCAG AA
- [ ] Confirm keyboard navigation works across all pages
- [ ] Full Playwright test run against production URL
- [ ] Read every page out loud — check for typos, awkward phrasing
- [ ] Owner final sign-off on all copy
- [ ] Check site on real mobile device
- [ ] Check site in Chrome, Firefox, Safari

### 5.3 Launch
- [ ] Merge to main / trigger production deploy
- [ ] Confirm live site loads correctly
- [ ] Share with a trusted person for a fresh-eyes review

---

## Phase 6 — Post-Launch (Backlog)

- [ ] Add analytics (privacy-conscious — Fathom, Plausible, or similar)
- [ ] Add `/writing` blog section
- [ ] Consider dark mode
- [ ] Set up uptime monitoring
- [ ] Schedule periodic content review (quarterly)

---

## Decisions Pending Owner Input

| # | Decision | Notes |
|---|---|---|
| 1 | Domain name | Not yet registered |
| 2 | Hosting platform | Vercel, Netlify, or GitHub Pages |

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
