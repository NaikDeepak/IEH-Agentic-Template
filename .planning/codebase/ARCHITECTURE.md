# Architecture

**Analysis Date:** 2026-01-16

## Pattern Overview

**Overall:** Client-Server architecture utilizing Backend-as-a-Service (BaaS) via Firebase and Serverless Functions (FaaS) for complex logic.

**Key Characteristics:**
- **Feature-Based Module Pattern:** Domain logic is organized into feature-specific directories (e.g., `src/features/jobs`).
- **Provider Pattern:** Global state (Authentication) is managed via React Context and Providers.
- **Service Layer:** Business logic and external API interactions are abstracted into service modules within features.

## Layers

**UI Layer (React):**
- Purpose: Handles user interaction and rendering.
- Location: `src/components`, `src/pages`, `src/App.tsx`
- Contains: React components, hooks, CSS modules.
- Depends on: Service Layer, Context Layer, Hooks.
- Used by: End users.

**Context Layer:**
- Purpose: Manages global state across the application.
- Location: `src/context`
- Contains: `AuthContext.ts`, `AuthProvider.tsx`
- Depends on: Infrastructure Layer (Firebase Auth).
- Used by: UI Layer.

**Service Layer:**
- Purpose: Encapsulates domain-specific business logic and data fetching.
- Location: `src/features/[feature]/services`
- Contains: `jobService.ts`, `candidateService.ts`
- Depends on: Infrastructure Layer (Firestore), Cloud Functions API.
- Used by: UI Layer (components/pages).

**Infrastructure Layer:**
- Purpose: Configures and exports core utilities for external services.
- Location: `src/lib`
- Contains: `firebase.ts`, `ai/embedding.ts`, `ai/search.ts`
- Depends on: Environment variables, Firebase SDK.
- Used by: Service Layer.

**Backend Layer (Firebase Functions):**
- Purpose: Handles sensitive operations, AI integrations, and complex queries (Vector Search).
- Location: `functions/index.js`
- Contains: Cloud Function handlers (Express API).
- Depends on: Firebase Admin SDK, Google GenAI SDK.
- Used by: Frontend Service Layer via HTTP requests.

## Data Flow

**Job Creation Flow:**

1. User submits a job form in `src/components/Login.tsx` (or similar UI).
2. UI calls `JobService.createJob` in `src/features/jobs/services/jobService.ts`.
3. `JobService` calls `/api/embedding` (Cloud Function) to generate a vector for the job description.
4. `JobService` saves the job data along with the embedding to Firestore using the Firebase SDK.

**AI Search Flow:**

1. User enters a query in `src/components/JobSearchBar.tsx`.
2. UI calls the search service which invokes the `/jobs/search` endpoint in `functions/index.js`.
3. Cloud Function generates an embedding for the search query via Gemini API.
4. Cloud Function executes a `findNearest` vector search query against Firestore using the REST API.
5. Cloud Function transforms and returns the results to the frontend.

**State Management:**
- Authentication state is managed by `AuthProvider` in `src/context/AuthProvider.tsx` and consumed via `useAuth` hook.

## Key Abstractions

**Service Objects:**
- Purpose: Singletons that group related business operations.
- Examples: `JobService` in `src/features/jobs/services/jobService.ts`.
- Pattern: Object-based service modules.

**Custom Hooks:**
- Purpose: Encapsulate reusable UI logic and context access.
- Examples: `useAuth` in `src/hooks/useAuth.ts`.
- Pattern: Standard React Hooks.

## Entry Points

**Frontend Entry:**
- Location: `src/main.tsx`
- Triggers: Browser page load.
- Responsibilities: Mounts React application, provides `AuthProvider`, initializes Sentry instrumentation.

**Backend Entry:**
- Location: `functions/index.js`
- Triggers: HTTP requests to Cloud Functions.
- Responsibilities: Configures Express app, initializes Firebase Admin, defines AI and search routes.

## Error Handling

**Strategy:** Multi-layered error handling with reporting.

**Patterns:**
- **Frontend:** Try-catch blocks in services that log to console and re-throw for UI-level handling.
- **Backend:** Centralized `handleError` function in `functions/index.js` that captures exceptions to Sentry and returns consistent JSON error responses.

## Cross-Cutting Concerns

**Logging:** Sentry is used for both frontend instrumentation (`src/instrument.ts`) and backend error tracking (`functions/index.js`).
**Validation:** Basic validation in services; vector validation for AI responses in `src/features/jobs/services/jobService.ts`.
**Authentication:** Managed via Firebase Auth with Google Provider integration.

---

*Architecture analysis: 2026-01-16*
