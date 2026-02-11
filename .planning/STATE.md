# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-16)

**Core value:** Semantic matching that connects the right talent to the right roles by understanding context, not just keywords.
**Current focus:** Phase 5 — Seeker Experience

## Current Position

Phase: 5 of 6 (Seeker Tools)
Plan: 7 of 11 (Skill Gap Analysis)
Status: In progress - Completed 05-07-PLAN.md
Last activity: 2026-02-11 — Implemented AI-driven skill gap analysis and learning loop.

Progress: █████████████████████████░ 92% (37/40 total planned tasks)

## Performance Metrics

**Velocity:**
- Total plans completed: 36
- Average duration: ~12m
- Total execution time: ~4.9 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation & Identity | 3 | 3 | 12.5m |
| 2. Marketplace Mechanics | 8 | 8 | ~10m |
| 3. Semantic Matching | 6 | 6 | ~11m |
| 4. Employer Suite | 12 | 12 | ~12m |
| 5. Seeker Tools | 7 | 11 | ~6m |

## Accumulated Context

### Decisions

| Date | Plan | Decision | Rationale |
|------|------|----------|-----------|
| 2026-02-11 | 05-07 | Gemini 2.0 Flash | Selected for speed and cost-efficiency in generating structured skill gap reports. |
| 2026-02-11 | 05-07 | Resource Saving | Allowed users to save specific resources to their profile (`saved_resources`) for later reference. |
| 2026-02-11 | 05-10 | Local Grading | Grading assessments client-side against AI-generated correct indices for immediate feedback. |
| 2026-02-11 | 05-10 | On-Demand Assessments | Generating questions just-in-time to ensure variety and minimize storage. |
| 2026-02-11 | 05-04 | Manual SchemaType | Defined local constants for Gemini SDK compatibility to avoid build errors with experimental types. |
| 2026-02-11 | 05-04 | Gemini 2.0 Flash | Selected for high speed and cost-efficiency in real-time resume analysis. |
| 2026-02-11 | 05-04 | Analyze-then-Persist | Persisting analysis results immediately to Firestore (`users/{uid}/resumes`) to enable downstream matching features. |
| 2026-02-11 | 05-03 | Generic Kanban Pattern | Used TypeScript generics and render props for KanbanBoard to support different card types (Applicant vs Seeker) while reusing DnD logic. |
| 2026-02-11 | 05-03 | Seeker Status Mapping | Re-labeled 'screening' to 'Interviewing' in Seeker view for better UX while maintaining internal status consistency. |
| 2026-02-11 | 05-02 | mammoth.js for DOCX | Chosen for high-fidelity semantic text extraction suitable for LLM consumption. |
| 2026-02-11 | 05-02 | Base64 PDF Prep | Simplified file transport to AI processing layers by converting PDFs to Base64. |
| 2026-02-11 | 05-05 | Cloud Function JS Usage | Used JavaScript for Cloud Functions to match the existing project configuration and avoid complex TS build setups for the proxy. |
| 2026-02-11 | 05-01 | Extension of Application Type | Reused existing Application interface but extended it with seeker-specific fields to avoid duplication. |
| 2026-02-11 | 05-01 | Tabbed Resume Entry | Provided multiple entry points (Upload, Paste, LinkedIn) to reduce friction for seekers. |
| 2026-02-10 | 04-12 | Cross-Collection Auth Check | Verified employer ownership via `get()` call to the linked job document in security rules. |
| 2026-02-10 | 04-11 | Persisted Bio Snapshot | Storing company bio directly on job posting ensures contextual consistency at time of post. |
| 2026-02-10 | 04-10 | Relaxed AI Validation | Allowed AI JD generation with only a title to improve exploratory UX. |
| 2026-02-10 | 04-10 | Dedicated Employer Dashboard | Created /employer/jobs to centralize job management and ATS access. |

### Pending Todos

- Phase 5: Implement Seeker Dashboard layout.
- Phase 5: Integrate verified skills into matchmaking.

### Blockers/Concerns

- None.

## Session Continuity

Last session: 2026-02-11
Stopped at: Completed Phase 5 Plan 10 (Verified Skill Proofs)
Resume file: .planning/phases/05-seeker-tools/05-11-PLAN.md
Session Continuity: Implemented assessment engine and UI. Ready for matching integration.
