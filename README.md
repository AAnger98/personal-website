# Personal Website

A personal website built with Astro, TypeScript strict mode, and vanilla CSS.

## Tech stack

- **Framework:** Astro
- **Language:** TypeScript (strict mode)
- **Styling:** Vanilla CSS with custom properties
- **Testing:** Playwright (E2E)

## Getting started

```sh
npm install
npm run dev
```

The dev server starts at `http://localhost:4321`.

## Commands

| Command            | Action                                          |
| :----------------- | :---------------------------------------------- |
| `npm install`      | Install dependencies                            |
| `npm run dev`      | Start the local dev server at `localhost:4321`  |
| `npm run build`    | Build the production site to `./dist/`          |
| `npm run preview`  | Preview the production build locally            |
| `npm run test`     | Run all Playwright E2E tests                    |
| `npm run lint`     | Lint TypeScript and Astro files with ESLint     |
| `npm run format`   | Format all files with Prettier                  |

## Running tests

Tests are written with [Playwright](https://playwright.dev/) and live in `tests/`.

The Playwright config automatically starts the dev server before running tests,
so no manual server startup is required.

```sh
# Run all tests
npm run test

# Run tests with Playwright's interactive UI
npx playwright test --ui

# Run a specific test file
npx playwright test tests/smoke.spec.ts
```

Tests must pass before any feature is considered complete. See `CLAUDE.md` for
the full development workflow.

## Project structure

```
/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable Astro components
│   ├── layouts/        # Page layout templates
│   │   └── BaseLayout.astro
│   ├── pages/          # Route pages (file = route)
│   │   └── index.astro
│   ├── styles/         # Shared CSS files
│   └── config.ts       # Site configuration (name, nav, contact)
├── tests/              # Playwright E2E tests
│   └── smoke.spec.ts
├── playwright.config.ts
└── tsconfig.json
```

## TypeScript

The project uses TypeScript strict mode via `astro/tsconfigs/strict`. Run a
type check at any time:

```sh
npx tsc --noEmit
```
