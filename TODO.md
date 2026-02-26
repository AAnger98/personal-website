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
- [ ] Define CSS custom properties for color palette (owner to provide values)
- [ ] Define typography scale (font sizes, line heights, weights)
- [ ] Choose and load typeface(s) — prefer system fonts or a single well-chosen web font
- [ ] Define spacing scale (margin/padding tokens)
- [ ] Write global reset / base styles
- [ ] Confirm styles look correct on mobile, tablet, desktop

### 2.2 Core Components
- [ ] Build `<Header>` component with site name and navigation
- [ ] Build `<Footer>` component with minimal info (name, year, optional links)
- [ ] Build `<PageTitle>` component for consistent heading style across pages
- [ ] Write Playwright tests for Header (nav links present and correct)
- [ ] Write Playwright tests for Footer (renders, no broken links)

---

## Phase 3 — Page Development (TDD: test → build → pass)

### 3.1 Home Page (`/`)
- [ ] Write Playwright test: page loads, has headline, has nav
- [ ] Draft copy: one-line positioning statement (owner to approve)
- [ ] Draft copy: 2–3 sentence intro (owner to approve)
- [ ] Build home page layout
- [ ] Add clear CTA linking to `/contact`
- [ ] Confirm Playwright test passes

### 3.2 About Page (`/about`)
- [ ] Write Playwright test: page loads, has heading, has body content
- [ ] Draft copy: background, expertise, what makes you worth hiring (owner to approve)
- [ ] Build about page layout
- [ ] Confirm Playwright test passes

### 3.3 Work Page (`/work`)
- [ ] Decide format with owner: list of roles? case studies? project cards?
- [ ] Write Playwright test: page loads, has at least one work entry
- [ ] Draft work entries (owner to approve)
- [ ] Build work page layout
- [ ] Confirm Playwright test passes

### 3.4 Contact Page (`/contact`)
- [ ] Decide contact method with owner: form? email link? both?
- [ ] Write Playwright test: page loads, contact method is visible and functional
- [ ] Build contact page layout
- [ ] If form: wire up form submission (static handler or simple service like Formspree)
- [ ] If form: write Playwright test for form submission flow
- [ ] Confirm all Contact tests pass

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
| 1 | Color palette | CSS custom properties ready; values TBD |
| 2 | Typeface selection | Pending design direction |
| 3 | Work page format | Roles list vs. case studies vs. cards |
| 4 | Contact method | Form vs. email link vs. both |
| 5 | Domain name | Not yet registered |
| 6 | Hosting platform | Vercel, Netlify, or GitHub Pages |
