# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Vite frontend only (port 5173, proxies /api to :8001)
npm start                # Express AI proxy server only (port 8001)
npm run dev:full         # Both concurrently (normal dev)
npm run dev:full:emulator  # Both + Firebase emulators + seed data

# Testing
npm run test             # Vitest unit tests (watch mode)
npm run coverage         # Vitest with coverage (must stay > 80%)
npm run test:e2e         # Playwright end-to-end tests
vitest run --reporter=verbose src/path/to/file.test.tsx  # Single file

# Quality
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit
npm run build            # Production build (emulator always off)

# Deploy — ALWAYS use these scripts, never bare `firebase deploy`
npm run deploy:staging   # build:staging → validate → deploy to india-emp-hub-dev
npm run deploy:prod      # build → validate → deploy to india-emp-hub

# The validate step (scripts/validate-dist.js) runs automatically between build
# and deploy. It blocks the deploy if:
#   - dist/ contains the wrong Firebase project ID
#   - dist/ contains emulator URLs (127.0.0.1:9099 / 8080)
# If you only changed functions/firestore rules (no frontend change), you still
# must run the full deploy script so the build is validated before upload.
```

Pre-commit hooks (husky + lint-staged) run ESLint and tsc on every `*.ts/*.tsx` commit.

## Architecture

This is a three-role SaaS job platform (seeker / employer / admin) with two runtime processes:

**Frontend** — React 19 + Vite + TypeScript + TailwindCSS v4. Talks to Firebase directly for auth/Firestore, and to the Express server for all AI calls.

**Express server** (`src/server/`, entry `index.js`) — Node.js AI proxy. Verifies Firebase ID tokens, then calls Gemini. This is the only place `GEMINI_API_KEY` lives. The Vite dev server proxies `/api` to `http://localhost:8001`.

**Firebase Functions** (`functions/`) — Cloud Functions for background triggers, growth/referral logic, and user onboarding. Deployed separately from the Express server.

### Source layout

```
src/
  context/        # AuthContext (type) + AuthProvider (implementation)
  features/       # Feature-first business logic
    seeker/       # Resume analysis, skill gap, interview prep, job tracker
    jobs/         # Job listings and services
    applications/ # Kanban board for employer applicant management
    candidates/   # Candidate search for employers
    companies/    # Company profiles
    growth/       # Referral engine, points ledger, phone/LinkedIn verification
    admin/        # Admin costing dashboard
  components/     # Shared/generic UI (also holds page-level landing components)
    ui/           # Primitives (Skeleton, etc.)
  pages/          # Route-level page components
    seeker/       # Seeker dashboard
    employer/     # Employer-specific pages
    admin/        # Admin pages
  lib/
    firebase.ts   # Firebase app, auth, db exports
    ai/           # callAIProxy() helper, embedding, search
    utils/
  server/         # Express server (JS, not bundled by Vite)
    features/     # ai, candidates, jobs, growth, user — controller/service/routes
    middleware/   # auth.js (Firebase token verification), errorHandler.js
    lib/          # firestore.js, gemini.js
  hooks/
    useAuth.ts    # Thin wrapper around AuthContext
```

### Auth flow

`AuthProvider` wraps the app and exposes `user` (FirebaseUser), `userData` (custom Firestore profile with role), and auth methods. `useAuth()` is the consumer hook. Role-based routing is enforced in `ProtectedRoute`.

`userData.role` is one of `'seeker' | 'employer' | 'admin'`. Employer sub-roles (`owner | recruiter | hiring_manager`) live in `userData.employerRole`.

### AI proxy pattern

All Gemini calls must go through `src/lib/ai/proxy.ts` → `callAIProxy(endpoint, body)`, which attaches the Firebase ID token. The Express server at `src/server/features/ai/` verifies the token and calls Gemini server-side. **Never expose `GEMINI_API_KEY` to the frontend or prefix it with `VITE_`.**

### Firebase emulator

The emulator is only activated when `VITE_USE_FIREBASE_EMULATOR=true` is set explicitly. Do **not** use `import.meta.env.DEV` as the condition — doing so breaks local dev against the live DB.

## Required environment variables

Frontend (`.env`):
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_SENTRY_DSN`, `VITE_SENTRY_AUTH_TOKEN`
- `VITE_USE_FIREBASE_EMULATOR=true` (only when using emulators)

Server (not prefixed with `VITE_`):
- `GEMINI_API_KEY` — set in Firebase Secrets or server env, never in frontend

## Workflow rules

**Docs first.** Before coding any change: update `docs/PRD.md` (product changes), `docs/TRD.md` (tech/schema changes), or create `docs/features/[feature_name].md`, then create a changelog entry in `docs/changelogs/YYYY-MM-DD-feature-name.md` (What / Where / Why). Code only after this.

**Branching.** Never commit directly to `main`. Branch naming: `feature/[name]`, `fix/[name]`. Open PRs on GitHub; do not merge locally.

**TDD cycle.** Red (failing test) → Green (minimum code) → Refactor → Playwright E2E for user-facing flows → coverage check (> 80%).

**Test file location.** Unit tests live in `__tests__/` alongside the component, or in `src/pages/__tests__/`. E2E tests live in `e2e/`.

**Constants over magic values.** No hardcoded strings or magic numbers — use constants files.
