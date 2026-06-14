# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MeuAlbum** is a mobile-first progressive web app (PWA) for tracking FIFA World Cup 2026 sticker collection. Users mark which stickers they own, which they need, and manage swaps. The visual design mirrors the feel of a physical sticker album (Copa do Mundo 2026) without using any trademarked Panini branding or official FIFA logos.

## Functional Especification

All businness rules are defined on `.md` files under `/docs`. One file for each functionality.

The `/docs/_hist` folder contais historical specs for comparison purpose. All versions are stored in a separeted folder, usindo `YYYYMMDD` format. When implementing a new version, check the latest historical specification and look for rules changin between versions, before creating the plan.

Folder `/docs/design_handoff` contains the wireframes, prototypes and others assets to drive the screen definition. You must stick to these definitions, unless any design definition is not supported by the specs files.

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

Hybrid deployment — frontend and backend are independently deployable:

- **Frontend**: Firebase Hosting — serves `client/dist` via global CDN (`firebase.json`)
- **Backend**: Cloud Run (`meualbum-api`, region `southamerica-east1`) — Express API in Docker container
- **Database**: MongoDB (cluster `ndab-meualbum`) — accessed via Mongoose
- **Communication**: Frontend uses relative `/api/**` URLs. Firebase Hosting rewrites `/api/**` → Cloud Run (same-origin from the browser's perspective). Cookies use `SameSite=None; Secure` in production and `SameSite=Lax` in development (controlled by `NODE_ENV`). This avoids cross-origin cookie blocking (Safari ITP, Chrome third-party cookie phase-out).

Full deployment guide: [`docs/DEPLOY.md`](docs/DEPLOY.md)

## Environment Variables


### Backend — runtime (GCP Secret Manager on Cloud Run)

| Variable | Secret | Description |
|----------|--------|-------------|
| `MONGODB_URI` | `MONGODB_URI:latest` | MongoDB Atlas connection string |
| `JWT_SECRET` | `JWT_SECRET:latest` | JWT signing key (min 32 random bytes) |
| `CLIENT_URL` | `CLIENT_URL:latest` | Firebase Hosting URL — sets allowed CORS origin and is used in email links |
| `RESEND_API_KEY` | `RESEND_API_KEY:latest` | Resend transactional email key; absent in dev → `logger.debug` fallback |
| `NODE_ENV` | `production` | Controls cookie `SameSite`, bcrypt rounds, rate limiting |
| `PORT` | `8080` | Set in Dockerfile; do not override |

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

# Run tests
npm test
npm test -- --testNamePattern="<name>"   # run a single test
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

Tests were built on Playwright and are stored on the following locations:

You must follow the rules on (tests/TESTS.md).

```
/
├── tests/          # Frontend testing
│   ├── _seed/      # Data for populating database before testing
├── test-results/          # Failed tests reports
│   ├── [test-name]/       # Test name
│   │   ├── error-context.md # Fail details
```

Run the full E2E suite with `npm run test:e2e` (`playwright test`). Before running, kill any active dev servers: `npx kill-port 5173` and `npx kill-port 3000`.

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

1. Write E2E tests that assert the business rules first.
2. Implement the feature/fix.
3. Run the full suite (`npm run test:e2e`).
4. Fix failures while preserving the business rules; repeat from step 3 until green.

## Design Principles

- **Mobile-first**: design for 375px viewport; use bottom navigation, large touch targets (≥ 44px).
- **Album aesthetic**: warm cream/yellow background, bold section headers that feel like album pages, sticker cards with slight paper texture and drop-shadow. No Panini/FIFA trademarks.
- **Performance**: sticker catalog may have 600–700 entries; virtualize long lists (`@tanstack/virtual`).
- **Accessibility**: maintain WCAG AA contrast ratios even with the warm color palette.

## Legal Requirements

Development must attend [LGPD](docs\legal\lgpd_guia_sistemas.md)

## Accesibility

Development must attend [WCAG 2.0 AA](docs\legal\wcag-2_0-aa-guia-sistemas.md) , but may seek WCAG 2.1 2.2 when possible.
