# External Integrations

**Analysis Date:** 2026-01-16

## APIs & External Services

**AI & Machine Learning:**
- Google Gemini API - Used for AI JD generation and text embeddings.
  - SDK/Client: `@google/genai`
  - Auth: `API_KEY` or `GEMINI_API_KEY` env vars.
  - Models: `gemini-2.0-flash` (Generation), `text-embedding-004` (Embeddings).

## Data Storage

**Databases:**
- Google Cloud Firestore
  - Connection: Initialized via `firebase-admin` in `index.js` and `firebase` SDK in frontend.
  - Client: `firebase-admin` (Backend), `firebase` (Frontend).
  - Features: Vector search with `COSINE` distance measure used in `index.js`.

**File Storage:**
- Firebase Storage
  - Rules defined in `storage.rules`.

**Caching:**
- Not explicitly detected (Firebase handles some client-side caching).

## Authentication & Identity

**Auth Provider:**
- Firebase Authentication
  - Implementation: Configured via `VITE_FIREBASE_*` environment variables in `.env`.

## Monitoring & Observability

**Error Tracking:**
- Sentry
  - Service: `@sentry/node`, `@sentry/react`
  - Config: `SENTRY_DSN` env var.

**Logs:**
- Standard console logging and Sentry exception capture.
- Firebase Functions logs accessible via `firebase functions:log`.

## CI/CD & Deployment

**Hosting:**
- Firebase Hosting - Configured in `firebase.json` to serve `dist/` directory.

**CI Pipeline:**
- Husky & lint-staged - Configured in `package.json` for pre-commit linting and type checking.

## Environment Configuration

**Required env vars:**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `API_KEY` (Gemini)
- `SENTRY_DSN`

**Secrets location:**
- `.env` file (local development).
- Cloud Secret Manager or Environment Variables in Cloud Run/Functions (production).

## Webhooks & Callbacks

**Incoming:**
- `/api/**` - Rewritten to Firebase Functions in `firebase.json`.
- `/api/ai/generate-jd` - Gemini integration endpoint.
- `/api/embedding` - Vector embedding endpoint.
- `/api/jobs/search` - Firestore vector search endpoint.

**Outgoing:**
- Requests to `firestore.googleapis.com` for vector search.
- Requests to Google Generative AI endpoints.

---

*Integration audit: 2026-01-16*
