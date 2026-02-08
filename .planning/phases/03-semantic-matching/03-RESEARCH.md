# Phase 03: Semantic Matching Engine - Research

**Researched:** 2026-02-07
**Domain:** Vector Search, AI Matching, Ranking
**Confidence:** HIGH

## Summary
Phase 3 focuses on enabling "Bi-directional Semantic Matching":
1.  **Job Search:** Candidates finding jobs (Partially implemented).
2.  **Candidate Search:** Employers finding talent (Missing).
3.  **Scoring & Tuning:** Ensuring results are relevant to the India IT/ITES context.

We will leverage **Firestore Vector Search** and **Google Gemini** embeddings (`text-embedding-004`).

## Current State Analysis

| Feature | Status | Implementation Details |
| :--- | :--- | :--- |
| **Job Embedding** | ✓ Implemented | `JobService.createJob` generates embedding via `/api/embedding`. |
| **Candidate Embedding** | ✓ Implemented | `CandidateService.updateProfile` generates embedding from bio/skills. |
| **Job Search** | ✓ Implemented | `searchJobsHandler` in `functions/index.js` uses Firestore `runQuery`. |
| **Candidate Search** | ✗ Missing | No API endpoint for searching the `users` collection. |
| **Scoring** | ⚠ Basic | Relies purely on Cosine Similarity. No domain weighting. |

## Technical Strategy

### 1. Candidate Search Architecture
We need a mirror of the Job Search architecture for Candidates.

**Endpoint:** `POST /api/candidates/search`
**Logic:**
1.  Employer sends query (e.g., "React native developer with 3 years exp").
2.  Generate embedding for query.
3.  Query `users` collection:
    -   Filter: `role == 'seeker'`
    -   Filter: `status == 'active'` (Crucial for Marketplace Mechanics)
    -   Vector Search on `embedding` field.
**Index Requirement:**
-   Collection: `users`
-   Vector Field: `embedding`
-   Dimensions: 768
-   Distance: Cosine
-   Pre-filters: `role`, `status` (Requires Composite Index)

### 2. Domain-Specific Tuning (India IT/ITES)
Raw keyword embeddings often miss context. "3 years experience" in a vector space is vague.

**Strategy: Query Expansion (RAG-lite)**
Before embedding the user's search query, pass it through Gemini:
> "Expand this search query for an Indian IT recruiter. Include related skills, alternative job titles, and common technologies used in this domain. Query: {userQuery}"

**Example:**
*Input:* "Frontend dev angular"
*Expanded:* "Frontend developer, Angular, TypeScript, RxJS, SPA, UI/UX, Webpack, detailed-oriented, Bangalore/Pune tech stack..."

This expanded text is then embedded, increasing the "surface area" for a match.

### 3. Scoring Engine
Firestore returns a `distance` metric (lower is better).
We need a "Match Score" (0-100%).

**Formula:**
`Score = (1 - CosineDistance) * 100`

**Hard Filters (Pre-filtering):**
Vector search is "fuzzy". If an employer needs "Bangalore" specifically, vector search might return "Pune" because they are semantically close (both Indian tech hubs).
*   **Action:** Implement strict filters for Location and Experience Level alongside vector search.

## Implementation Plan

### Plan 1: Candidate Search API
-   Create `searchCandidatesHandler` in `functions/index.js`.
-   Ensure Firestore indexes are documented for creation.
-   Frontend: Simple search UI for Employers.

### Plan 2: Enhanced Matching (Query Expansion)
-   Update `searchJobsHandler` and `searchCandidatesHandler` to use Gemini for query expansion.
-   Refine the `semanticText` generation in `JobService` and `CandidateService` to include more structured data (e.g., "Years of Experience: X").

### Plan 3: Match Visualization
-   UI indicators for "Match Score".
-   "Why this matched" explanation (optional v2, but good for MVP trust).

## Risks & Mitigations
-   **Index Limits:** Firestore has limits on index creation rate. We need to create them early.
-   **Cost:** Vector search + GenAI calls per search.
    -   *Mitigation:* Cache embeddings for identical queries? (Maybe over-optimization for MVP).
    -   *Mitigation:* Keep `limit` low (e.g., 20 results).

## Sources
-   [Firestore Vector Search Docs](https://firebase.google.com/docs/firestore/vector-search)
-   Existing `functions/index.js` implementation.
