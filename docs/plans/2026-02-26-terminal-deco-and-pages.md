# Terminal Deco Design System + Page Development

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

---

## Execution Status (updated 2026-02-26)

| Task | Status | Notes |
|---|---|---|
| Task 1 — CSS Custom Properties | ✅ Complete | Done in prior session |
| Task 2 — Load Google Fonts | 🟡 Partial | `<link>` tags added to BaseLayout.astro; `tests/design-system.spec.ts` created; tests NOT verified (blocked) |
| Tasks 3–13 | ⬜ Not started | Blocked |

**Blocker:** `npm run dev` (Astro dev server) fails to start. Process launches silently — no output to stdout/stderr, port 4321 never binds. When Playwright tries to start it as a WebServer, it surfaces as `UNKNOWN: unknown error, read` in Node.js's ESM module loader. Direct `node -e "require(..."` calls to individual files work. Suspected cause: Node.js v24 + Windows/OneDrive interaction with ESM module loading. **Must resolve before proceeding.**

**Uncommitted changes at pause point:**
- `src/layouts/BaseLayout.astro` — Google Fonts link tags added
- `tests/design-system.spec.ts` — new file

---

**Goal:** Complete the Terminal Deco design system (colors, fonts, visual components) and build all four v1 pages (Home, About, Work, Contact) with placeholder copy.

**Architecture:** Update the CSS foundation with confirmed palette + Google Fonts, build reusable Terminal Deco components (border frame, corner accents, ASCII divider, CRT scanline), restyle the existing Header/Footer/PageTitle to match the aesthetic, then scaffold all four pages with structural layouts and placeholder copy awaiting owner approval.

**Tech Stack:** Astro, vanilla CSS custom properties, TypeScript strict, Playwright for E2E tests, Google Fonts (Archivo Black + Major Mono Display — already approved dependency).

---

## Context

**Codebase state going in:**

- `src/styles/global.css` — CSS custom properties exist but use placeholder colors (white bg, dark text, system font). These are wrong and need replacing.
- `src/layouts/BaseLayout.astro` — functional; no Google Fonts loaded yet.
- `src/components/Header.astro` — functional (hamburger nav works); unstyled for Terminal Deco.
- `src/components/Footer.astro` — functional; unstyled for Terminal Deco.
- `src/components/PageTitle.astro` — functional; unstyled for Terminal Deco.
- `src/pages/index.astro` — only has `<h1>Welcome</h1>`, no real content.
- No `src/pages/about.astro`, `work.astro`, or `contact.astro` yet.
- `tests/` — smoke, responsive, and component tests all pass.

**Running the dev server:** `npm run dev` (starts on `http://localhost:4321`)

**Running tests:** `npx playwright test` (starts dev server automatically, runs Chromium only)

**TypeScript check:** `npx tsc --noEmit`

**Confirmed color palette (never use raw hex in component files — always reference these vars):**

| Var | Hex | Role |
|---|---|---|
| `--color-bg` | `#1B3022` | Page background (deep forest green) |
| `--color-green` | `#4F772D` | Primary brand green |
| `--color-blue` | `#8EA8C3` | Accent — muted blue-grey |
| `--color-peach` | `#E29578` | Accent — warm terracotta |
| `--color-gold` | `#D4AF37` | Deco accent — borders, corners |
| `--color-text` | `#E5E5E5` | Primary text (off-white) |

**Confirmed fonts:**
- Display/headlines: `'Archivo Black'` — via Google Fonts
- Accent/UI/labels: `'Major Mono Display'` — via Google Fonts
- Body/default: `'Courier New', Courier, monospace` — system fallback

**Copy rule:** All body copy in pages is placeholder. Never treat it as final without explicit owner sign-off.

---

## Task 1: Update CSS Custom Properties

**Files:**
- Modify: `src/styles/global.css` (lines 1–28 — the `:root` block)

**Step 1: Replace the `:root` block in `src/styles/global.css`**

Replace the entire current `:root { ... }` block with:

```css
:root {
  /* ── Colors — Terminal Deco palette (confirmed, see CLAUDE.md) ───────── */
  --color-bg: #1b3022;
  --color-green: #4f772d;
  --color-blue: #8ea8c3;
  --color-peach: #e29578;
  --color-gold: #d4af37;
  --color-text: #e5e5e5;

  /* ── Typography ──────────────────────────────────────────────────────── */
  --font-display: 'Archivo Black', 'Arial Black', sans-serif;
  --font-mono-accent: 'Major Mono Display', monospace;
  --font-body: 'Courier New', Courier, monospace;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;
  --font-size-3xl: 3rem;
  --line-height-base: 1.6;
  --line-height-heading: 1.2;

  /* ── Spacing ─────────────────────────────────────────────────────────── */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;
}
```

Also update the `body` rule (currently line 37–44) to use the new variables:

```css
body {
  margin: 0;
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: var(--color-text);
  background-color: var(--color-bg);
}
```

**Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors. (We haven't touched `.ts` files, this is just a sanity check.)

**Step 3: Start dev server and visually verify**

```bash
npm run dev
```

Open `http://localhost:4321` in browser. The page should now have a dark forest-green background. Text should be off-white. If you still see a white background, hard-refresh (Ctrl+Shift+R).

**Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: update CSS custom properties with confirmed Terminal Deco palette"
```

---

## Task 2: Load Google Fonts in BaseLayout

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

**Step 1: Add Google Fonts `<link>` tags inside `<head>`**

Open `src/layouts/BaseLayout.astro`. In the `<head>` block, after `<meta name="viewport">` and before `<link rel="icon">`, add:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Major+Mono+Display&display=swap"
  rel="stylesheet"
/>
```

The full `<head>` should look like:

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Major+Mono+Display&display=swap"
    rel="stylesheet"
  />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <title>{pageTitle}</title>
</head>
```

**Step 2: Verify fonts load**

With dev server running, open `http://localhost:4321` and open DevTools → Network tab. Filter for "fonts.googleapis.com". You should see the stylesheet request. The rendered page font should now be Courier New (body) — Archivo Black and Major Mono will only apply once we wire them to elements.

**Step 3: Write a Playwright test to verify the font link exists**

Create a new file `tests/design-system.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('Design system', () => {
  test('body has dark background (Terminal Deco palette)', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );
    // #1b3022 → rgb(27, 48, 34)
    expect(bg).toBe('rgb(27, 48, 34)');
  });

  test('Google Fonts stylesheet is referenced in document head', async ({ page }) => {
    await page.goto('/');
    const fontLink = page.locator('link[href*="Archivo+Black"]');
    await expect(fontLink).toHaveCount(1);
  });
});
```

**Step 4: Run the new test**

```bash
npx playwright test tests/design-system.spec.ts
```

Expected: both tests PASS.

**Step 5: Run full test suite to confirm nothing regressed**

```bash
npx playwright test
```

Expected: all tests pass.

**Step 6: Commit**

```bash
git add src/layouts/BaseLayout.astro tests/design-system.spec.ts
git commit -m "feat: load Google Fonts and add design system tests"
```

---

## Task 3: Add CRT Scanline Overlay

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/global.css`

The CRT scanline effect is a subtle horizontal line repeating pattern overlaid on the entire page using a fixed `::before` pseudo-element. It should not block pointer events or scroll.

**Step 1: Wrap page content in a `.page-wrapper` div in `BaseLayout.astro`**

In `src/layouts/BaseLayout.astro`, change the `<body>` content from:

```html
<body>
  <Header />
  <main>
    <slot />
  </main>
  <Footer />
</body>
```

To:

```html
<body>
  <div class="page-wrapper">
    <Header />
    <main>
      <slot />
    </main>
    <Footer />
  </div>
</body>
```

**Step 2: Add scanline styles to `src/styles/global.css`**

Append at the end of `global.css`:

```css
/* ─── CRT scanline overlay ───────────────────────────────────────────────────
   Creates subtle horizontal scan lines across the full viewport.
   pointer-events: none ensures it doesn't block clicks or hover.
   ─────────────────────────────────────────────────────────────────────────── */
.page-wrapper {
  position: relative;
  min-height: 100vh;
}

.page-wrapper::before {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 3px,
    rgba(0, 0, 0, 0.06) 3px,
    rgba(0, 0, 0, 0.06) 4px
  );
  pointer-events: none;
  z-index: 9999;
}
```

**Step 3: Visually verify**

Reload `http://localhost:4321`. You should see a very faint scanline texture across the page. If it's too strong, reduce the `rgba` opacity value (0.06 is already subtle). If you can't see it at all, try temporarily setting it to 0.2 to confirm it's working.

**Step 4: Run tests to confirm nothing broke**

```bash
npx playwright test
```

Expected: all tests pass. (The overlay is non-interactive; existing tests remain unaffected.)

**Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro src/styles/global.css
git commit -m "feat: add CRT scanline overlay via page-wrapper pseudo-element"
```

---

## Task 4: Restyle Header with Terminal Deco

**Files:**
- Modify: `src/components/Header.astro`

The Header needs to go from a generic light nav to the Terminal Deco aesthetic: dark background (inherits body), gold double-border at bottom, site name in Archivo Black, nav links in Major Mono Display uppercase, hamburger bars in gold color.

**Step 1: Replace the `<style>` block in `Header.astro`**

The existing `<style>` block at lines 39–118 should be replaced entirely with:

```css
<style>
  .site-header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding: var(--space-sm) var(--space-lg);
    border-bottom: 4px double var(--color-gold);
  }

  .site-name {
    text-decoration: none;
    font-family: var(--font-display);
    font-size: var(--font-size-xl);
    color: var(--color-text);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-right: auto;
  }

  /* ── Hamburger button ── */
  .nav-toggle {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-xs);
    color: var(--color-gold);
  }

  .bar {
    display: block;
    width: 22px;
    height: 2px;
    background: var(--color-gold);
  }

  /* ── Mobile nav ── */
  @media (max-width: 767px) {
    .site-nav {
      display: none;
      width: 100%;
    }

    .site-nav.is-open {
      display: block;
    }

    .site-nav ul {
      padding: var(--space-sm) 0;
      border-top: 1px solid var(--color-gold);
      margin-top: var(--space-sm);
    }

    .site-nav li {
      padding: var(--space-xs) 0;
    }

    .site-nav a {
      font-family: var(--font-mono-accent);
      font-size: var(--font-size-sm);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      text-decoration: none;
      color: var(--color-text);
    }
  }

  /* ── Desktop nav ── */
  @media (min-width: 768px) {
    .nav-toggle {
      display: none;
    }

    .site-nav {
      display: flex;
      align-items: center;
    }

    .site-nav ul {
      display: flex;
      gap: var(--space-md);
    }

    .site-nav a {
      font-family: var(--font-mono-accent);
      font-size: var(--font-size-sm);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      text-decoration: none;
      color: var(--color-text);
      border: 2px double transparent;
      padding: var(--space-xs) var(--space-sm);
      transition: all steps(4) 0.15s;
    }

    .site-nav a:hover {
      border-color: var(--color-gold);
      color: var(--color-gold);
    }
  }
</style>
```

**Step 2: Run existing component tests to confirm header still works**

```bash
npx playwright test tests/components.spec.ts
```

Expected: all Header tests pass (header visible, site name present, nav links correct).

**Step 3: Run responsive tests**

```bash
npx playwright test tests/responsive.spec.ts
```

Expected: all pass (hamburger still functions).

**Step 4: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: apply Terminal Deco styling to Header component"
```

---

## Task 5: Restyle Footer with Terminal Deco

**Files:**
- Modify: `src/components/Footer.astro`

**Step 1: Replace the Footer content and style**

Replace the entire file content with:

```astro
---
import { siteConfig } from '../config';
const year = new Date().getFullYear();
---

<footer class="site-footer">
  <div class="footer-divider" aria-hidden="true">━━━━━ ❈ ━━━━━</div>
  <p class="footer-text">{siteConfig.name} &middot; {year}</p>
</footer>

<style>
  .site-footer {
    padding: var(--space-md) var(--space-lg);
    border-top: 4px double var(--color-gold);
    text-align: center;
  }

  .footer-divider {
    color: var(--color-gold);
    font-family: var(--font-mono-accent);
    letter-spacing: 0.1em;
    margin-bottom: var(--space-sm);
    font-size: var(--font-size-sm);
  }

  .footer-text {
    margin: 0;
    font-family: var(--font-mono-accent);
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--color-blue);
  }
</style>
```

**Step 2: Run footer tests**

```bash
npx playwright test tests/components.spec.ts
```

Expected: all Footer tests pass (footer visible, site name present, year present, no empty hrefs).

**Step 3: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: apply Terminal Deco styling to Footer component"
```

---

## Task 6: Update PageTitle Component

**Files:**
- Modify: `src/components/PageTitle.astro`

**Step 1: Replace the file content**

```astro
---
interface Props {
  title: string;
}
const { title } = Astro.props;
---

<h1 class="page-title">{title}</h1>

<style>
  .page-title {
    font-family: var(--font-display);
    font-size: var(--font-size-2xl);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text);
    text-shadow:
      2px 2px 0 var(--color-gold),
      4px 4px 0 rgba(212, 175, 55, 0.25);
    margin: 0 0 var(--space-lg);
    line-height: var(--line-height-heading);
  }
</style>
```

**Step 2: Verify visually**

With dev server running, open the home page. The "Welcome" h1 (currently the only PageTitle usage) should render in a large font with a gold shadow offset.

**Step 3: Commit**

```bash
git add src/components/PageTitle.astro
git commit -m "feat: apply Terminal Deco styling to PageTitle component"
```

---

## Task 7: Build DecoBorder Component

**Files:**
- Create: `src/components/DecoBorder.astro`

This is a reusable wrapper component that applies an Art Deco double-border frame with geometric corner accents. Use it to wrap content sections on pages.

**Step 1: Create `src/components/DecoBorder.astro`**

```astro
---
interface Props {
  class?: string;
}
const { class: className } = Astro.props;
---

<div class:list={['deco-border', className]}>
  <span class="corner corner-tl" aria-hidden="true">◆</span>
  <span class="corner corner-tr" aria-hidden="true">◆</span>
  <div class="deco-content">
    <slot />
  </div>
  <span class="corner corner-bl" aria-hidden="true">◆</span>
  <span class="corner corner-br" aria-hidden="true">◆</span>
</div>

<style>
  .deco-border {
    position: relative;
    border: 4px double var(--color-gold);
    padding: var(--space-lg);
  }

  .corner {
    position: absolute;
    color: var(--color-gold);
    font-size: 0.9rem;
    line-height: 1;
    /* Offset corners to overlap the border edge */
    background: var(--color-bg);
    padding: 0 2px;
  }

  .corner-tl { top: -0.65rem; left: var(--space-sm); }
  .corner-tr { top: -0.65rem; right: var(--space-sm); }
  .corner-bl { bottom: -0.65rem; left: var(--space-sm); }
  .corner-br { bottom: -0.65rem; right: var(--space-sm); }

  .deco-content {
    /* Ensure content sits above the corners in stacking context */
    position: relative;
  }
</style>
```

**Step 2: Verify it renders correctly**

Use the component in `src/pages/index.astro` temporarily to check it looks right. (You'll do this properly in Task 10 anyway.)

**Step 3: Commit**

```bash
git add src/components/DecoBorder.astro
git commit -m "feat: add DecoBorder component with Art Deco double-border and corner accents"
```

---

## Task 8: Build AsciiDivider Component

**Files:**
- Create: `src/components/AsciiDivider.astro`

**Step 1: Create `src/components/AsciiDivider.astro`**

```astro
---
interface Props {
  symbol?: string;
}
const { symbol = '❈' } = Astro.props;
---

<div class="ascii-divider" aria-hidden="true">━━━━━ {symbol} ━━━━━</div>

<style>
  .ascii-divider {
    text-align: center;
    color: var(--color-gold);
    font-family: var(--font-mono-accent);
    letter-spacing: 0.2em;
    font-size: var(--font-size-sm);
    margin: var(--space-lg) 0;
    user-select: none;
  }
</style>
```

**Step 2: Commit**

```bash
git add src/components/AsciiDivider.astro
git commit -m "feat: add AsciiDivider component for Terminal Deco section breaks"
```

---

## Task 9: Home Page

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `tests/smoke.spec.ts` (extend with home page assertions)

**Step 1: Write the failing Playwright test**

Add to `tests/smoke.spec.ts` (append after the existing test):

```ts
test('home page has a heading and a contact CTA link', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  const ctaLink = page.locator('a[href="/contact"]');
  await expect(ctaLink).toHaveCount(1);
  await expect(ctaLink).toBeVisible();
});
```

**Step 2: Run to confirm it fails**

```bash
npx playwright test tests/smoke.spec.ts
```

Expected: the new test FAILs with "locator expected to have count 1" (no `/contact` link exists yet).

**Step 3: Build the home page**

Replace the entire `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import PageTitle from '../components/PageTitle.astro';
import DecoBorder from '../components/DecoBorder.astro';
import AsciiDivider from '../components/AsciiDivider.astro';
---

<BaseLayout title="Home">
  <section class="home-hero">
    <PageTitle title="Your Name" />

    <p class="home-tagline">
      {/* COPY PLACEHOLDER — owner approval required */}
      Strategy. Operations. Getting things done.
    </p>

    <AsciiDivider />

    <DecoBorder>
      <p class="home-intro">
        {/* COPY PLACEHOLDER — owner approval required */}
        Brief intro — 2–3 sentences about who this person is and what they bring to
        the table. Warm but professional. Let the work speak.
      </p>
      <a href="/contact" class="cta-link">Get in touch ›</a>
    </DecoBorder>
  </section>
</BaseLayout>

<style>
  .home-hero {
    max-width: 720px;
    margin: 0 auto;
    padding: var(--space-xl) var(--space-md);
    text-align: center;
  }

  .home-tagline {
    font-family: var(--font-mono-accent);
    font-size: var(--font-size-lg);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--color-blue);
    margin-bottom: var(--space-lg);
  }

  .home-intro {
    font-size: var(--font-size-base);
    line-height: var(--line-height-base);
    color: var(--color-text);
    margin-bottom: var(--space-lg);
  }

  .cta-link {
    display: inline-block;
    font-family: var(--font-mono-accent);
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-gold);
    border: 2px double var(--color-gold);
    padding: var(--space-sm) var(--space-lg);
    text-decoration: none;
    transition: all steps(4) 0.15s;
  }

  .cta-link:hover {
    background: var(--color-gold);
    color: var(--color-bg);
  }
</style>
```

**Step 4: Run tests to confirm they pass**

```bash
npx playwright test tests/smoke.spec.ts
```

Expected: both tests PASS.

**Step 5: Run full test suite**

```bash
npx playwright test
```

Expected: all tests pass.

**Step 6: Commit**

```bash
git add src/pages/index.astro tests/smoke.spec.ts
git commit -m "feat: build home page layout with placeholder copy and contact CTA"
```

---

## Task 10: About Page

**Files:**
- Create: `src/pages/about.astro`
- Create: `tests/pages.spec.ts`

**Step 1: Write the failing test**

Create `tests/pages.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

// ─── About page ──────────────────────────────────────────────────────────────

test.describe('About page', () => {
  test('loads without error and has a heading', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('has body content (not an empty page)', async ({ page }) => {
    await page.goto('/about');
    const mainText = await page.locator('main').textContent();
    expect(mainText?.trim().length).toBeGreaterThan(50);
  });
});
```

**Step 2: Run to confirm it fails**

```bash
npx playwright test tests/pages.spec.ts
```

Expected: tests FAIL (404 on `/about`).

**Step 3: Create `src/pages/about.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import PageTitle from '../components/PageTitle.astro';
import DecoBorder from '../components/DecoBorder.astro';
import AsciiDivider from '../components/AsciiDivider.astro';
---

<BaseLayout title="About">
  <article class="about-page">
    <PageTitle title="About" />

    <AsciiDivider />

    <DecoBorder>
      <section class="about-section">
        <h2 class="section-label">Background</h2>
        {/* COPY PLACEHOLDER — owner approval required */}
        <p>
          A few sentences about background and career arc. Where did this person
          come from? What domains have they worked in? Keep it brief — visitors
          already have a name; they're here for context.
        </p>
      </section>

      <section class="about-section">
        <h2 class="section-label">Expertise</h2>
        {/* COPY PLACEHOLDER — owner approval required */}
        <p>
          What does this person actually do? What problems do they solve? Be
          specific — generic buzzwords undercut credibility.
        </p>
      </section>

      <section class="about-section">
        <h2 class="section-label">Why work together</h2>
        {/* COPY PLACEHOLDER — owner approval required */}
        <p>
          What makes this person worth hiring or collaborating with? One honest
          paragraph. No jargon.
        </p>
      </section>
    </DecoBorder>
  </article>
</BaseLayout>

<style>
  .about-page {
    max-width: 720px;
    margin: 0 auto;
    padding: var(--space-xl) var(--space-md);
  }

  .about-section {
    margin-bottom: var(--space-lg);
  }

  .about-section:last-child {
    margin-bottom: 0;
  }

  .section-label {
    font-family: var(--font-mono-accent);
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--color-gold);
    margin: 0 0 var(--space-sm);
  }
</style>
```

**Step 4: Run tests to confirm they pass**

```bash
npx playwright test tests/pages.spec.ts
```

Expected: About page tests PASS.

**Step 5: Commit**

```bash
git add src/pages/about.astro tests/pages.spec.ts
git commit -m "feat: scaffold About page with placeholder copy"
```

---

## Task 11: Work Page

**Files:**
- Create: `src/pages/work.astro`
- Modify: `tests/pages.spec.ts`

**Note:** The work page format (roles list vs. case studies vs. cards) is a pending decision. This task implements a chronological roles list — the simplest format that requires no additional data structures. If the owner chooses a different format, this is easy to rework.

**Step 1: Add failing Work page tests to `tests/pages.spec.ts`**

Append to `tests/pages.spec.ts`:

```ts
// ─── Work page ───────────────────────────────────────────────────────────────

test.describe('Work page', () => {
  test('loads without error and has a heading', async ({ page }) => {
    const response = await page.goto('/work');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('has at least one work entry', async ({ page }) => {
    await page.goto('/work');
    // Each role entry should have a heading inside the work list
    const entries = page.locator('.work-entry');
    await expect(entries).toHaveCount({ minimum: 1 });
  });
});
```

**Step 2: Run to confirm it fails**

```bash
npx playwright test tests/pages.spec.ts
```

Expected: Work page tests FAIL (404).

**Step 3: Create `src/pages/work.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import PageTitle from '../components/PageTitle.astro';
import AsciiDivider from '../components/AsciiDivider.astro';

// COPY PLACEHOLDER — owner to provide real entries and approve
const workEntries = [
  {
    title: 'Role Title',
    org: 'Organization Name',
    period: '20XX – 20XX',
    description: 'Brief description of the role and key accomplishments. 1–3 sentences.',
  },
  {
    title: 'Role Title',
    org: 'Organization Name',
    period: '20XX – 20XX',
    description: 'Brief description of the role and key accomplishments. 1–3 sentences.',
  },
];
---

<BaseLayout title="Work">
  <section class="work-page">
    <PageTitle title="Work" />

    <AsciiDivider />

    <ul class="work-list">
      {workEntries.map((entry) => (
        <li class="work-entry">
          <div class="work-header">
            <span class="work-title">{entry.title}</span>
            <span class="work-period">{entry.period}</span>
          </div>
          <div class="work-org">{entry.org}</div>
          <p class="work-description">{entry.description}</p>
        </li>
      ))}
    </ul>
  </section>
</BaseLayout>

<style>
  .work-page {
    max-width: 720px;
    margin: 0 auto;
    padding: var(--space-xl) var(--space-md);
  }

  .work-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .work-entry {
    border-left: 4px solid var(--color-gold);
    padding-left: var(--space-md);
  }

  .work-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    flex-wrap: wrap;
    gap: var(--space-sm);
    margin-bottom: var(--space-xs);
  }

  .work-title {
    font-family: var(--font-display);
    font-size: var(--font-size-lg);
    color: var(--color-text);
  }

  .work-period {
    font-family: var(--font-mono-accent);
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-blue);
  }

  .work-org {
    font-family: var(--font-mono-accent);
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-gold);
    margin-bottom: var(--space-sm);
  }

  .work-description {
    margin: 0;
    line-height: var(--line-height-base);
    color: var(--color-text);
  }
</style>
```

**Step 4: Run tests to confirm they pass**

```bash
npx playwright test tests/pages.spec.ts
```

Expected: all Work page tests PASS.

**Step 5: Commit**

```bash
git add src/pages/work.astro tests/pages.spec.ts
git commit -m "feat: scaffold Work page with placeholder role entries"
```

---

## Task 12: Contact Page

**Files:**
- Create: `src/pages/contact.astro`
- Modify: `tests/pages.spec.ts`

**Note:** The contact method (form vs. email link vs. both) is a pending owner decision. This implements a simple `mailto:` link — no form, no JavaScript, no third-party service required. Easy to extend later.

**Step 1: Add failing Contact page tests to `tests/pages.spec.ts`**

Append to `tests/pages.spec.ts`:

```ts
// ─── Contact page ─────────────────────────────────────────────────────────────

test.describe('Contact page', () => {
  test('loads without error and has a heading', async ({ page }) => {
    const response = await page.goto('/contact');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('has a visible contact link', async ({ page }) => {
    await page.goto('/contact');
    const contactLink = page.locator('a[href^="mailto:"]');
    await expect(contactLink).toBeVisible();
    const href = await contactLink.getAttribute('href');
    // href must not be the placeholder — owner must swap in real email
    expect(href).toMatch(/^mailto:.+@.+\..+/);
  });
});
```

**Step 2: Run to confirm it fails**

```bash
npx playwright test tests/pages.spec.ts
```

Expected: Contact page tests FAIL (404).

**Step 3: Update `src/config.ts` with real email (owner to provide)**

The current placeholder is `hello@example.com`. Until the owner provides a real email, the contact link test above will pass structurally but the email won't work. That's acceptable — the test checks format, not deliverability. Flag this for owner: they need to update `siteConfig.contact.email` in `src/config.ts` before launch.

**Step 4: Create `src/pages/contact.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import PageTitle from '../components/PageTitle.astro';
import DecoBorder from '../components/DecoBorder.astro';
import AsciiDivider from '../components/AsciiDivider.astro';
import { siteConfig } from '../config';
---

<BaseLayout title="Contact">
  <section class="contact-page">
    <PageTitle title="Contact" />

    <AsciiDivider />

    <DecoBorder>
      {/* COPY PLACEHOLDER — owner approval required */}
      <p class="contact-intro">
        The best way to reach me is by email. I try to respond within a business day.
      </p>
      <a href={`mailto:${siteConfig.contact.email}`} class="contact-link">
        {siteConfig.contact.email}
      </a>
    </DecoBorder>
  </section>
</BaseLayout>

<style>
  .contact-page {
    max-width: 720px;
    margin: 0 auto;
    padding: var(--space-xl) var(--space-md);
    text-align: center;
  }

  .contact-intro {
    margin-bottom: var(--space-lg);
    line-height: var(--line-height-base);
    color: var(--color-text);
  }

  .contact-link {
    display: inline-block;
    font-family: var(--font-mono-accent);
    font-size: var(--font-size-lg);
    text-transform: lowercase;
    letter-spacing: 0.08em;
    color: var(--color-gold);
    border-bottom: 2px solid var(--color-gold);
    text-decoration: none;
    padding-bottom: 2px;
    transition: color steps(4) 0.15s;
  }

  .contact-link:hover {
    color: var(--color-peach);
    border-color: var(--color-peach);
  }
</style>
```

**Step 5: Run all tests**

```bash
npx playwright test
```

Expected: all tests pass.

**Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 7: Commit**

```bash
git add src/pages/contact.astro tests/pages.spec.ts
git commit -m "feat: scaffold Contact page with mailto link"
```

---

## Task 13: Final Verification

**Step 1: Run the full test suite**

```bash
npx playwright test
```

Expected: all tests in `smoke.spec.ts`, `responsive.spec.ts`, `components.spec.ts`, `design-system.spec.ts`, and `pages.spec.ts` pass.

**Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

**Step 3: Visual review checklist (manual)**

Start the dev server (`npm run dev`) and open each page. Verify:

- [ ] Dark forest green background visible on all pages
- [ ] Header: site name in Archivo Black, nav links in Major Mono uppercase, gold double-border bottom
- [ ] Footer: gold double-border top, Major Mono uppercase, ASCII divider visible
- [ ] Home: PageTitle with gold text-shadow, tagline in Major Mono, DecoBorder with corner accents, CTA link
- [ ] About: three sections inside DecoBorder, section labels in gold Major Mono
- [ ] Work: role entries with gold left-border, title/period/org/description visible
- [ ] Contact: intro text, gold mailto link
- [ ] Mobile (375px): hamburger button visible, nav hidden by default, nav opens on tap
- [ ] No horizontal overflow on any page at 375px, 768px, 1280px
- [ ] CRT scanline texture visible on all pages (subtle horizontal lines)

**Step 4: Update TODO.md**

Mark completed items in `TODO.md`:

```
Phase 2.1:
- [x] Update CSS custom properties with confirmed palette values
- [x] Load Google Fonts — Archivo Black + Major Mono Display
- [x] Apply dark background
- [x] Confirm styles look correct on mobile, tablet, desktop

Phase 2.3:
- [x] Build Art Deco double-border frame component (DecoBorder)
- [x] Build geometric corner accent decoration
- [x] Build CRT scanline overlay
- [x] Define ASCII divider pattern (AsciiDivider)
- [x] Define nav button style with stepped hover transition
- [x] Write Playwright test: page has dark background

Phase 3:
- [x] Home page (pending copy approval)
- [x] About page (pending copy approval)
- [x] Work page (pending copy approval + format decision)
- [x] Contact page (pending copy approval + email update)
```

**Step 5: Final commit**

```bash
git add TODO.md
git commit -m "chore: mark Phase 2 and Phase 3 tasks complete in TODO"
```

---

## Pending Owner Actions (flag these, do not block on them)

| # | Item | Notes |
|---|---|---|
| 1 | Real email address | Update `siteConfig.contact.email` in `src/config.ts` |
| 2 | Real name | Update `siteConfig.name` in `src/config.ts` |
| 3 | Home page copy | Tagline + intro paragraph approval |
| 4 | About page copy | Background, expertise, why-work-together sections |
| 5 | Work entries | Real roles + descriptions; confirm list format or request different format |
| 6 | Contact page copy | Intro paragraph approval |
| 7 | Work page format | Confirm roles list is acceptable; alternatives are cards or case studies |
