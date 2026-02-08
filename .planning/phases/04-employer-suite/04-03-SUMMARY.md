---
phase: 04-employer-suite
plan: 03
subsystem: Applicant Tracking (ATS)
tags: [kanban, dnd-kit, firestore, applications]
requires: [04-02]
provides: [kanban-pipeline, application-management]
tech-stack:
  added:
    - "@dnd-kit/core"
    - "@dnd-kit/sortable"
    - "@dnd-kit/utilities"
  patterns: [Kanban Board, Drag and Drop, Optimistic Updates]
key-files:
  created:
    - src/features/applications/types.ts
    - src/features/applications/services/applicationService.ts
    - src/features/applications/components/KanbanBoard.tsx
    - src/features/applications/components/KanbanColumn.tsx
    - src/features/applications/components/ApplicantCard.tsx
    - src/pages/employer/JobApplicants.tsx
  modified:
    - src/App.tsx
decisions:
  - date: 2026-02-08
    plan: 04-03
    decision: ATS Kanban Implementation
    rationale: Implemented a drag-and-drop Kanban board using @dnd-kit for applicant status management. Used optimistic updates in the UI for a snappy experience while persisting changes to Firestore.
metrics:
  duration: 2m
  completed: 2026-02-08
---

# Phase 04 Plan 03: Basic ATS Kanban Board Summary

## Objective
Implement core ATS (Applicant Tracking System) functionality using a Kanban board to manage candidate progression through the hiring lifecycle.

## Deliverables
- **Application Schema & Service**: Defined `Application` interface and implemented `ApplicationService` for fetching job-specific applications and updating their status.
- **Kanban Board Component**: A fully interactive drag-and-drop board built with `@dnd-kit`, featuring columns for 'Applied', 'Screening', 'Interview', 'Offer', 'Hired', and 'Rejected'.
- **Applicant Card UI**: Displays candidate name, role, and match score within the pipeline columns.
- **Job Applicants Page**: A specialized view for employers to manage the pipeline for a specific job posting, integrated into the application routing.

## Deviations from Plan
None - plan executed exactly as written.

## Decisions Made
- **Optimistic Updates**: The `JobApplicants` page updates the local state immediately upon a drag-and-drop action to ensure a smooth user experience, with a revert mechanism if the Firestore update fails.
- **Column Definition**: Standardized on a 6-stage pipeline to cover the typical Indian IT/ITES hiring flow.

## Next Phase Readiness
The Employer Suite core functionality is now complete. The system is ready to move to Phase 5 (Seeker Tools), which will involve building the candidate-side application experience to feed into this pipeline.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
