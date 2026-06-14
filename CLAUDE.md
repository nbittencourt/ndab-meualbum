# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MeuAlbum** is a mobile-first progressive web app (PWA) for tracking FIFA World Cup 2026 sticker collection. Users mark which stickers they own, which they need, and manage swaps. The visual design mirrors the feel of a physical sticker album (Copa do Mundo 2026) without using any trademarked Panini branding or official FIFA logos.

## Functional Specification

All business rules are defined on `.md` files under `/docs`. One file for each functionality.

The `/docs/_hist` folder contains historical specs for comparison purposes. All versions are stored in a separated folder, using `YYYYMMDD` format. When implementing a new version, check the latest historical specification and look for rules changing between versions, before creating the plan.

Folder `/docs/design_handoff` contains the wireframes, prototypes and other assets to drive the screen definition. You must stick to these definitions, unless any design definition is not supported by the specs files.

### Source-of-truth hierarchy

When sources disagree, resolve authority in this order:

1. **Design handoff** (`/docs/design_handoff/`) — visual fidelity of existing screens.
2. **Canonical specs** (`/docs/spec_*.md`) — business rules, especially when newer than the design.
3. **Current implementation** — a starting point, but it may be outdated.

When the design handoff is **silent** about a requirement (e.g. LGPD, WCAG, data export, age-gate), the canonical spec is authoritative — implement it even if no wireframe shows it. Cross-cutting concerns (LGPD, WCAG) apply to **every new screen**, regardless of the wireframe. Divergences across the three sources must be escalated as an explicit decision before coding.

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB (dev) or Firestore (tst, prd) — cluster `ndab-meualbum`
- **Target**: Mobile browsers; deploy as PWA

## Deployment Architecture

See [`docs/DEPLOY.md`](docs/DEPLOY.md) for full infrastructure, environment variables, and deploy steps.

## Project Structure

```
/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/       # Global state (Zustand or Context)
│   │   └── lib/         # API client, helpers
│   └── vite.config.ts
├── server/          # Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── models/      # Mongoose models
│   │   └── middleware/
│   └── tsconfig.json
└── shared/          # Types shared between client and server
```

## Development Commands

```bash
# Install all dependencies (root + workspaces)
npm install

# Run frontend dev server
npm run dev:client        # http://localhost:5173

# Run backend dev server (with hot reload)
npm run dev:server        # http://localhost:3000

# Run both simultaneously
npm run dev

# Build
npm run build             # builds client and server

# Lint
npm run lint

# Type-check
npm run typecheck

# Run tests (Vitest — unit/integration, all workspaces)
npm test
npm test -w server        # server only
npm test -w client        # client only

# Run E2E suite (Playwright)
npm run test:e2e
npm test -- --testNamePattern="<name>"   # filter a single vitest test
```

## Architecture Notes

### Data Model

Core collections in MongoDB:
- `users` — auth + preferences
- `stickers` — full catalog (number, section, player/subject, country, rarity)
- `collections` — per-user owned/needed/duplicate sticker state
- `swaps` — swap offer/request matching between users

### State Management

Client state is split:
- **Server state** (sticker catalog, user collection): React Query / TanStack Query
- **UI state** (filters, modals): Zustand or React Context

### API Design

RESTful JSON API under `/api/v1/`. Auth via JWT (stored in httpOnly cookie, not localStorage — XSS mitigation).

### PWA

The client should register a service worker for offline access to the sticker catalog. Use Vite PWA plugin (`vite-plugin-pwa`).

### Code Conventions

Canonical building blocks — **reuse these, do not reimplement locally**:

- **Album variant styling**: `client/src/lib/albumVariant.ts` is the single source for `VARIANT_STYLES` and `VARIANT_LABELS`. Any component rendering an album card/badge must import from `@/lib/albumVariant` — never copy the tables locally.
- **Cookie consent**: read/write consent only through `client/src/lib/cookieConsent.ts` (`getConsent()`, `hasValidConsent()`, `saveConsent()`). Bump `CURRENT_POLICY_VERSION` manually when the privacy policy changes materially.
- **Camera capture + OCR**: use the reusable `client/src/components/CameraModal.tsx`. It takes `onConfirm(numero): Promise<void>` and a customizable `nextLabel`. OCR runs **client-side** (Tesseract.js via dynamic `import()` to keep the initial bundle clean); never send camera frames or images to the backend.

### Tests

The project has two test layers. Choose based on what the test exercises:

| Layer | Tool | Where | Command | Use for |
|-------|------|--------|---------|---------|
| Unit / integration | Vitest | `server/src/__tests__/`, `client/src/__tests__/` | `npm test` | Pure logic, business rules, utility functions, API contracts |
| E2E | Playwright | `tests/` | `npm run test:e2e` | Screen flows, navigation, multi-step UI interactions |

**Rule: reach for Vitest first.** If the rule under test does not require a browser or live server, write a Vitest spec. E2E is environment-sensitive and slow — reserve it for flows that genuinely need a browser.

You must follow the rules on [tests/TESTS.md](tests/TESTS.md).

```
/
├── tests/          # E2E (Playwright)
│   ├── _seed/      # Data for populating database before testing
├── test-results/          # Failed tests reports
│   ├── [test-name]/       # Test name
│   │   ├── error-context.md # Fail details
```

Run the full E2E suite with `npm run test:e2e` (`playwright test`). Before running, kill any active dev servers: `npx kill-port 5173` and `npx kill-port 3000`.

#### Anti-subversion rule

**Never modify a test to make it pass.** The test defines the contract; code adapts to the test, never the reverse.

- If a test fails deterministically and cannot pass without modifying the test itself, stop and report which test and why.
- Permitted edits to test files: (a) fixing selectors/assertions after an intentional UI change, confirmed deterministic; (b) bumping `timeout` on legitimately slow specs (e.g. axe-core). Never soften a business-rule assertion.
- Commit test files before implementing the corresponding feature — the diff acts as a read-only contract snapshot.

This rule applies to both Vitest and Playwright specs. See [tests/TESTS.md](tests/TESTS.md) — "flakiness" never justifies weakening a business-rule check.

#### Testing conventions

- **Cookie banner suppression**: importing `{ test, expect }` from `tests/support/fixtures.ts` auto-loads a valid cookie consent into `localStorage`, suppressing the banner. Tests that need to exercise the banner itself must import from `@playwright/test` directly.
- **Policy version sync**: `CURRENT_POLICY_VERSION` in `tests/support/fixtures.ts` must be kept in sync with `client/src/lib/cookieConsent.ts`. If they diverge, the banner reappears in every fixture-based test and breaks unrelated flows.

#### Diagnosing failures: rule out flakiness first

This suite runs on a single Windows machine and is sensitive to load (the `vite dev` server has crashed under sustained runs — `0xC0000409` — and CPU-heavy specs like axe-core a11y can intermittently exceed the 10s global timeout). **Before investigating or "fixing" a failing test, re-run it in isolation to confirm the failure is real and not flakiness:**

```bash
npx playwright test --project=mobile <file> -g "<test name>"
```

- If it **passes in isolation** but fails in the full run, treat it as environment flakiness — do **not** change the test's logic. The harness already absorbs this via `retries` in `playwright.config.ts`; if a spec is legitimately slow (e.g. axe-core), bump its timeout (`test.describe.configure({ timeout })`) rather than rewriting assertions.
- If it **fails deterministically in isolation**, it is a real failure — fix it following the source-of-truth hierarchy (Design › Spec › Implementation).
- Only edit a test's selectors/assertions once you have confirmed the failure is deterministic. Chasing a flaky failure as if it were a logic bug wastes effort and can mask real regressions.

#### TDD workflow

When implementing a new or changed business rule, follow test-driven development:

1. Write tests first (Vitest for pure logic; Playwright for screen flows).
2. Implement the feature/fix.
3. Run the relevant suite (`npm test` or `npm run test:e2e`).
4. Fix failures while preserving the business rules; repeat from step 3 until green.

## Design Principles

- **Mobile-first**: design for 375px viewport; use bottom navigation, large touch targets (≥ 44px).
- **Album aesthetic**: warm cream/yellow background, bold section headers that feel like album pages, sticker cards with slight paper texture and drop-shadow. No Panini/FIFA trademarks.
- **Performance**: sticker catalog may have 600–700 entries; virtualize long lists (`@tanstack/virtual`).
- **Accessibility**: maintain WCAG AA contrast ratios even with the warm color palette.

## Legal Requirements

Development must attend [LGPD](docs/legal/lgpd_guia_sistemas.md)

## Accessibility

Development must attend [WCAG 2.0 AA](docs/legal/wcag-2_0-aa-guia-sistemas.md), but may seek WCAG 2.1/2.2 when possible.
