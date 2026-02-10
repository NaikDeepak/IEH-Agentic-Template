# Copilot Instructions for IEH Webapp

## Build, Test & Lint

```bash
# Development
npm run dev              # Frontend only (Vite on :5173)
npm run dev:full         # Frontend + Backend concurrently
npm start                # Backend only (Express on :3000)

# Build & Type Check
npm run build            # TypeScript compile + Vite build
npm run typecheck        # TypeScript check only

# Testing
npm test                 # Run Vitest in watch mode
npm test -- --run        # Run all tests once
npm test -- path/to/file.test.ts      # Run single test file
npm test -- -t "test name"            # Run test by name
npm run coverage         # Run with coverage report

# E2E Testing
npm run test:e2e         # Playwright tests (starts dev server automatically)
npx playwright test e2e/landing-page.spec.ts  # Run single E2E test

# Linting
npm run lint             # ESLint
```

## Architecture

### Dual-Stack Application
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS 4
- **Backend**: Express.js server in `src/server/` with entry point at `index.js`
- **Database**: Firebase Firestore with security rules in `firestore.rules`
- **Deployment**: Vercel (frontend) + Firebase Functions (`functions/`)

### Frontend Structure (`src/`)
- `pages/` - Route-level components
- `features/` - Domain modules (jobs, candidates, companies, applications, admin)
- `components/` - Shared UI components
- `context/` - React context providers (AuthProvider)
- `hooks/` - Custom hooks (useAuth pattern throws if outside provider)
- `lib/` - Firebase config, AI utilities

### Backend Structure (`src/server/`)
- `features/` - Domain controllers/routes (ai, jobs, candidates)
- `middleware/` - Auth, error handling
- `routes.js` - API route mounting at `/api/v1`
- Legacy compatibility: `/api/*` routes also work

### Key API Endpoints
```
/api/v1/ai/embedding     - Generate text embeddings (768-dim vectors)
/api/v1/ai/generate-jd   - Generate job descriptions with AI
/api/v1/jobs/search      - Semantic job search
/api/v1/candidates/search - Semantic candidate search
```

## Code Conventions

### Naming
- Components: `PascalCase.tsx`
- Hooks: `use*.ts` (e.g., `useAuth.ts`)
- Services: `camelCase.ts` (e.g., `jobService.ts`)
- Tests: `*.test.ts` or `*.test.tsx`

### Exports
- Named exports for components and services
- Default exports for configs only

### Error Handling
- `try/catch` with `console.error` for logging
- Sentry integration (`@sentry/react`, `@sentry/node`) for production
- Custom hooks throw if used outside their provider context

### ESLint Rules
- `no-console`: warns on `console.log`, allows `warn`/`error`
- `@typescript-eslint/no-floating-promises`: errors on unhandled promises
- Pre-commit hooks via Husky run ESLint + TypeScript check

## Firebase & Firestore

### Collections
- `users` - User profiles with roles (`seeker`, `employer`, `admin`)
- `jobs` - Job postings with 768-dim embeddings for semantic search
- `applications` - Job applications linking candidates to jobs
- `companies` - Employer company profiles

### Role-Based Access
- Roles are immutable after creation
- `ProtectedRoute` component enforces frontend access control
- Firestore rules enforce backend access control

### Embeddings
- 768-dimensional vectors for semantic search
- Validated in Firestore rules (size and type checks)
- Generated via Google Gemini API

## Testing

### Vitest (Unit Tests)
- Setup in `src/test/setup.ts` with global mocks
- Mocks browser APIs (IntersectionObserver, ResizeObserver, matchMedia)
- Mocks external services (Firebase, Gemini, Sentry)
- 80% coverage threshold enforced

### Playwright (E2E)
- Tests in `e2e/` directory
- Runs against `localhost:5173`
- Auto-starts dev server in non-CI environments
