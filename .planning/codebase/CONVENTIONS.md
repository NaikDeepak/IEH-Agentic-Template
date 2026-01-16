# Coding Conventions

**Analysis Date:** 2026-01-16

## Naming Patterns

**Files:**
- Components: PascalCase.tsx (e.g., `src/components/HeroSection.tsx`)
- Hooks: camelCase.ts (e.g., `src/hooks/useAuth.ts`)
- Services/Lib: camelCase.ts (e.g., `src/features/jobs/services/jobService.ts`)
- Tests: `filename.test.tsx` or `filename.test.ts`

**Functions:**
- React Components: PascalCase functions or arrow functions (e.g., `export const HeroSection = () => ...`)
- Hooks: `use` prefix followed by camelCase (e.g., `useAuth`)
- Standard Functions: camelCase (e.g., `generateEmbedding`)

**Variables:**
- camelCase for local variables and props
- PascalCase for Context objects (e.g., `AuthContext`)
- UPPER_SNAKE_CASE for environment variables and constants (e.g., `VITE_FIREBASE_API_KEY`)

**Types:**
- Interfaces: PascalCase (e.g., `interface GlobalMocks`)
- Type Aliases: PascalCase

## Code Style

**Formatting:**
- Controlled via ESLint. Single quotes are preferred for strings in some files, but double quotes are also seen in Firebase configs.
- Semi-colons are consistently used.

**Linting:**
- Tool: ESLint v9
- Configuration: `eslint.config.js`
- Key rules:
  - `@typescript-eslint/strict-Type-Checked` and `stylistic-Type-Checked`
  - React hooks and accessibility (`jsx-a11y`) rules
  - `no-console`: Warns on `console.log`, allows `warn` and `error`
  - `@typescript-eslint/no-floating-promises`: Errors on unhandled promises

## Import Organization

**Order:**
1. React and third-party libraries (e.g., `react`, `firebase/auth`)
2. Project internal modules/hooks (e.g., `../context/AuthContext`)
3. Component styles or assets

**Path Aliases:**
- Standard relative paths are used (e.g., `../context/AuthContext`).
- Vitest configuration uses some aliases for module resolution (e.g., `@google/genai`).

## Error Handling

**Patterns:**
- Standard `try/catch` blocks for asynchronous operations.
- Logging: `console.error` with descriptive messages.
- Production Error Tracking: Sentry integration using `captureException(error)`.
- Context Safeguards: Custom hooks throw errors if used outside their provider (e.g., `src/hooks/useAuth.ts`).

## Logging

**Framework:** `console` and Sentry (`@sentry/react`, `@sentry/node`).

**Patterns:**
- `console.error` is used for catching errors in services and components.
- Sentry is used for capturing exceptions in production environments.

## Comments

**When to Comment:**
- Descriptive comments for configuration sections (e.g., `src/lib/firebase.ts`).
- Documentation for test mocks and setup logic (e.g., `src/test/setup.ts`).

**JSDoc/TSDoc:**
- Minimal usage detected in the core components; mostly used for type definitions.

## Function Design

**Size:**
- Components are generally focused and keep logic minimal, delegating to hooks or services.

**Parameters:**
- Props objects for React components.
- Named parameters or direct arguments for service functions.

**Return Values:**
- Functional components return JSX.
- Hooks return state objects or functions.
- Services return Promises (async).

## Module Design

**Exports:**
- Named exports are preferred for components and services (e.g., `export const useAuth = ...`).
- Default exports are used for configurations (e.g., `eslint.config.js`, `vitest.config.ts`).

**Barrel Files:**
- Not extensively used; direct imports from file paths are common.

---

*Convention analysis: 2026-01-16*
