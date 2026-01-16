# Codebase Structure

**Analysis Date:** 2026-01-16

## Directory Layout

```
IEH/
├── functions/              # Firebase Cloud Functions (Express API)
│   ├── index.js            # Main backend entry and route handlers
│   └── package.json        # Backend dependencies
├── public/                 # Static assets for the web app
├── src/                    # Frontend React application
│   ├── assets/             # Images and static files used in components
│   ├── components/         # Reusable UI components (Header, Footer, etc.)
│   ├── context/            # React Context providers (AuthContext)
│   ├── features/           # Domain-driven modules (jobs, candidates)
│   │   ├── jobs/           # Job-related logic, services, and types
│   │   └── candidates/     # Candidate-related logic, services, and types
│   ├── hooks/              # Custom React hooks (useAuth)
│   ├── lib/                # Infrastructure utilities (Firebase, AI SDKs)
│   ├── pages/              # Page components (LandingPage)
│   ├── test/               # Test setup and utilities
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Frontend entry point
├── tests/                  # Playwright E2E tests
├── firebase.json           # Firebase configuration
├── firestore.rules         # Security rules for Firestore
├── package.json            # Project manifest and dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

## Directory Purposes

**functions/:**
- Purpose: Backend logic running on Firebase Cloud Functions.
- Contains: Express.js API, AI integration logic (Gemini), and Vector Search implementation.
- Key files: `functions/index.js`

**src/features/:**
- Purpose: Organizes code by business domain rather than technical type.
- Contains: Services, types, and potentially feature-specific components.
- Key files: `src/features/jobs/services/jobService.ts`, `src/features/jobs/types.ts`

**src/lib/:**
- Purpose: Low-level wrappers and configurations for external libraries.
- Contains: Firebase initialization and AI utility functions.
- Key files: `src/lib/firebase.ts`, `src/lib/ai/embedding.ts`

**src/components/:**
- Purpose: Shared UI building blocks.
- Contains: Functional components and their associated styles/tests.
- Key files: `src/components/Header.tsx`, `src/components/HeroSection.tsx`

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React application mount point.
- `functions/index.js`: Cloud Functions API entry point.

**Configuration:**
- `firebase.json`: Firebase deployment and local emulator settings.
- `vite.config.ts`: Frontend build and dev server settings.
- `firestore.rules`: Database security constraints.

**Core Logic:**
- `src/features/jobs/services/jobService.ts`: Job management business logic.
- `functions/index.js`: Server-side search and AI generation logic.

**Testing:**
- `src/test/setup.ts`: Vitest configuration.
- `tests/`: Playwright E2E tests.
- `src/components/__tests__/`: Unit tests for components.

## Naming Conventions

**Files:**
- Components: PascalCase (`Header.tsx`)
- Services: camelCase (`jobService.ts`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- Tests: `[Name].test.tsx` or `[Name].spec.ts`

**Directories:**
- General: kebab-case (`job-search-bar`) or simple lowercase (`hooks`, `lib`).

## Where to Add New Code

**New Feature:**
- Primary code: Create a new directory in `src/features/[feature-name]`.
- Tests: Co-locate with components or in `src/features/[feature-name]/__tests__`.

**New Component/Module:**
- Shared UI: `src/components/[ComponentName].tsx`.
- Page: `src/pages/[PageName].tsx`.

**Utilities:**
- Shared helpers: `src/lib/utils.ts` (if generic) or within a feature service.

## Special Directories

**.planning/:**
- Purpose: Project documentation and mapping (GSD system).
- Generated: Yes (by AI agents).
- Committed: Yes.

---

*Structure analysis: 2026-01-16*
