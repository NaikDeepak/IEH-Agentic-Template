# Phase 3 Plan 01: Search Infrastructure Summary

## 1. Overview
**One-liner:** Established backend and frontend infrastructure for filtered bi-directional semantic search (Candidates & Jobs).

**Status:** Complete
**Duration:** ~15m
**Date:** 2026-02-07

## 2. Key Deliverables
- **Firestore Indexes:** Added composite indexes for `jobs` (status + embedding) and `users` (role + status + embedding) to support filtered vector search.
- **Backend Handlers:**
  - Refactored `functions/index.js` with a reusable `runVectorSearch` helper.
  - Implemented `searchCandidatesHandler` with filters (`role='seeker'`, `status='active'`).
  - Updated `searchJobsHandler` to enforce `status='active'`.
  - Added public data whitelisting for candidate results.
- **Frontend Client:**
  - Updated `src/lib/ai/search.ts` with typed `searchCandidates` and `searchJobs` methods.
  - Added type definitions for search results.

## 3. Decisions Made
| Decision | Rationale |
| ... | ... |
| **Firestore REST API for Vector Search** | Continued using the REST API pattern established in Phase 1 as the Node.js Admin SDK's vector search support is still evolving/beta or requires different setup, and REST is stable and lightweight for this context. |
| **Backend-Side Filtering** | Enforced `status='active'` on the backend to prevent inactive/passive entities from even being retrieved, optimizing payload size and ensuring marketplace rules. |
| **Whitelisting Candidate Fields** | Explicitly selected public fields (displayName, bio, skills, etc.) in `searchCandidatesHandler` to prevent leaking private data like email or phone numbers. |
| **Timestamp Unwrapping** | Added `timestampValue` handling to the Firestore JSON unwrapper to correctly process date fields from the REST API response. |

## 4. Tech Stack Updates
- **Patterns:** Reusable `runVectorSearch` helper for consistent vector query logic.
- **Security:** Explicit field whitelisting for user data exposure.

## 5. Metrics & Deviations
- **Duration:** ~15 minutes (Estimated: 20m)
- **Deviations:**
  - [Rule 1 - Bug] Added `timestampValue` to the `unwrap` helper in `functions/index.js` as it was missing and would cause dates to be dropped or malformed.
  - [Rule 2 - Missing Critical] Added basic type interfaces in `src/lib/ai/search.ts` to ensure type safety for the new return values.

## 6. Next Phase Readiness
- **Next Plan:** 03-02 (Embeddings Generation)
- **Blockers:** None.
- **Notes:** The infrastructure is now ready to support the actual generation of embeddings for users and jobs in the next plan.
