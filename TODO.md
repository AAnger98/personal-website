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
- [ ] Add `lang` attribute to `<html>`
- [ ] Ensure all images have `alt` text
- [ ] Verify heading hierarchy is correct on all pages (h1 → h2 → h3)
- [ ] Check color contrast ratios meet WCAG AA
- [ ] Confirm keyboard navigation works across all pages
- [ ] Add skip-to-content link

### 4.2 Performance
- [ ] Audit with Lighthouse: target 95+ on Performance, Accessibility, Best Practices, SEO
- [ ] Ensure no unused JavaScript is shipped
- [ ] Optimize any images (use Astro's built-in image optimization)
- [ ] Verify fast load on mobile (throttled connection)

### 4.3 SEO & Meta
- [ ] Add `<meta>` description to every page
- [ ] Add Open Graph tags (title, description, image) for link previews
- [ ] Add `<link rel="canonical">` tags
- [ ] Create `robots.txt`
- [ ] Create `sitemap.xml` (Astro has a plugin for this)

---

## Phase 5 — Pre-Launch

### 5.1 Domain & Hosting
- [ ] Choose and register domain name
- [ ] Choose hosting platform (Vercel / Netlify / GitHub Pages)
- [ ] Configure deployment pipeline (push to main → auto deploy)
- [ ] Point domain DNS to host
- [ ] Confirm HTTPS is active

### 5.2 Final Review
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
| 1 | Work page format | Roles list scaffolded — confirm or request cards/case studies |
| 2 | Contact method | mailto link scaffolded — confirm or request form |
| 3 | Domain name | Not yet registered |
| 4 | Hosting platform | Vercel, Netlify, or GitHub Pages |

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
