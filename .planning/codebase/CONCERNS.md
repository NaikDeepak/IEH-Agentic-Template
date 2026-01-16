# Codebase Concerns

**Analysis Date:** 2026-01-16

## Tech Debt

**API Logic Duplication:**
- Issue: Significant logic duplication between the root `index.js` and `functions/index.js`. Both files define similar Express apps with endpoints for `/api/embedding`, `/api/jobs/search`, and `/api/ai/generate-jd`.
- Files: `index.js`, `functions/index.js`
- Impact: Increased maintenance burden, risk of logic drift between local/containerized execution and Firebase Functions.
- Fix approach: Consolidate shared logic into a shared library or a single entry point that can be exported for both Express and Firebase Functions.

**Environment Variable Inconsistency:**
- Issue: Mixed usage of `import.meta.env` (Vite) and `process.env` (Node) across the codebase, sometimes within the same execution context or in files meant to be shared.
- Files: `src/lib/firebase.ts`, `src/lib/ai/embedding.ts`, `index.js`, `functions/index.js`
- Impact: Confusing configuration, potential runtime errors when moving code between client and server environments.
- Fix approach: Standardize on a configuration wrapper or ensure environment-specific logic is strictly isolated.

**Manual Semantic Text Construction:**
- Issue: The logic for combining fields into a string for embedding generation is hardcoded and manual.
- Files: `src/features/jobs/services/jobService.ts`
- Impact: Brittle search. If job fields change, the embedding logic might become outdated or inconsistent.
- Fix approach: Use a dedicated schema-aware utility to generate semantic strings for embeddings.

## Known Bugs

**Role Selection Bypass:**
- Symptoms: `RoleSelection.tsx` returns null if `userData.role` is present, but doesn't handle the state where `userData` is null or loading robustly in all paths.
- Files: `src/components/RoleSelection.tsx`
- Trigger: Rapid navigation or slow Firestore response during first login.
- Workaround: Handled by `AuthContext` mostly, but component logic is fragile.

## Security Considerations

**Hardcoded Secrets in Version Control:**
- Risk: Sensitive API keys for Firebase and Gemini are stored in a `.env` file within the `functions/` directory, which appears to be committed to the repository.
- Files: `functions/.env`
- Current mitigation: None detected.
- Recommendations: Immediately remove secrets from version control, rotate the keys, and use a secret management service (e.g., Google Cloud Secret Manager or Firebase Secrets).

**Firestore REST API Authorization:**
- Risk: `functions/index.js` manually acquires and uses an access token to call the Firestore REST API for vector search.
- Files: `functions/index.js`
- Current mitigation: Uses `google-auth-library` for server-to-server auth.
- Recommendations: Transition to the official Firestore Admin SDK once it fully supports `findNearest` in the environment, or encapsulate this in a more robust service layer.

**Client-Side Embedding Calls:**
- Risk: Client-side code calls `/api/embedding` directly. While intended, this allows users to potentially generate embeddings for arbitrary text on the project's budget.
- Files: `src/features/jobs/services/jobService.ts`
- Current mitigation: Basic field presence check.
- Recommendations: Implement rate limiting and ensure calls are only made for valid job posting/search actions.

## Performance Bottlenecks

**Large Payload in Vector Search:**
- Problem: Vector search returns full job documents. While embeddings are deleted from the response, many fields are still unwrapped manually.
- Files: `functions/index.js`, `index.js`
- Cause: Manual REST API response unwrapping.
- Improvement path: Optimize the `unwrap` helper and ensure only necessary fields are sent to the client.

**Redundant Embedding Generation:**
- Problem: Job updates trigger embedding regeneration if any semantic field key is present in the update object, even if the value is identical.
- Files: `src/features/jobs/services/jobService.ts`
- Cause: `shouldRegenEmbedding` check only looks at key presence.
- Improvement path: Compare new values with `currentData` before triggering the `fetchEmbedding` call.

## Fragile Areas

**Hardcoded Project IDs:**
- Files: `index.js`, `functions/index.js`
- Why fragile: Defaulting to `india-emp-hub` if env vars are missing makes the code less portable.
- Safe modification: Always require `VITE_FIREBASE_PROJECT_ID` or `GCLOUD_PROJECT`.
- Test coverage: Gaps in testing environment-specific fallbacks.

## Scaling Limits

**Vector Search Results:**
- Current capacity: Hardcoded limits (default 10).
- Limit: REST API response size for large numbers of documents.
- Scaling path: Implement pagination or cursor-based search if result sets grow.

## Dependencies at Risk

- Not detected.

## Missing Critical Features

**Audit Logs:**
- Problem: No tracking of job modifications or user role changes beyond `updated_at` timestamps.
- Blocks: Security auditing and troubleshooting.

## Test Coverage Gaps

**Untested UI Components:**
- What's not tested: Almost all components in `src/components` (Header, Footer, Hero, JobSearchBar, etc.) lack unit tests.
- Files: `src/components/*.tsx`
- Risk: UI regressions during refactoring go unnoticed.
- Priority: Medium

**Service Layer Edge Cases:**
- What's not tested: Error handling in `jobService.ts` and `candidateService.ts` for network failures or invalid Firestore states.
- Files: `src/features/jobs/services/jobService.ts`, `src/features/candidates/services/candidateService.ts`
- Risk: Silent failures in critical business logic.
- Priority: High

---

*Concerns audit: 2026-01-16*
