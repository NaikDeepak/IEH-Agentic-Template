---
status: resolved
trigger: "ats-kanban-empty"
created: 2026-02-09T12:00:00Z
updated: 2026-02-09T12:45:00Z
---

## Current Focus

hypothesis: The Kanban board had an independent implementation bug where `ApplicantCard` used `useDraggable` instead of `useSortable`, which is required for `SortableContext` in `dnd-kit`. This would have caused issues even if jobs were present.
test: Refactored `ApplicantCard` to use `useSortable`.
expecting: Correct drag-and-drop behavior once data is present.
next_action: Archived session.

## Symptoms

expected: Click "View Applicants" on a job. See Kanban board with columns (Applied, Screening, Interview, etc.). If empty, run `npx tsx scripts/seed-applications.ts [jobId]`. Verify applicant cards appear. Drag a card to a different column - status updates immediately.
actual: fail as no jobs present , ned to resolve earlier issues first
errors: Error: Embedding service failed: 404 at fetchEmbedding (jobService.ts:35:15)
reproduction: Test 5 in UAT (caused by failure in Test 4)
started: Discovered during UAT

## Eliminated

- hypothesis: Seed script is missing.
  evidence: `scripts/seed-jobs.ts` and `scripts/seed-applications.ts` exist.
  timestamp: 2026-02-09T12:07:00Z

## Evidence

- timestamp: 2026-02-09T12:25:00Z
  checked: `vite.config.ts`
  found: Proxy configured for `/api` to `http://localhost:8001`.
  implication: Local development expects a backend at port 8001.

- timestamp: 2026-02-09T12:35:00Z
  checked: `ApplicantCard.tsx` and `KanbanColumn.tsx`
  found: `KanbanColumn` uses `SortableContext`, but `ApplicantCard` uses `useDraggable`.
  implication: This is a configuration error in `dnd-kit`. For `SortableContext` to work, the children must use `useSortable`. `useDraggable` is for basic dragging outside of sortable lists.

- timestamp: 2026-02-09T12:37:00Z
  checked: `scripts/seed-applications.ts`
  found: It fails if no jobs are in Firestore.
  implication: The seed script works but is logically dependent on `seed-jobs.ts` or successful UI job creation.

## Resolution

root_cause: The primary blocker was a cascading failure from Job Creation (embedding 404), resulting in no jobs to view. However, an independent bug existed in the Kanban implementation: `ApplicantCard` used `useDraggable` instead of `useSortable`, which is incompatible with the `SortableContext` used in `KanbanColumn`.
fix: Refactored `ApplicantCard.tsx` to use `useSortable` and `CSS` utilities from `@dnd-kit`.
verification: Code inspection confirms compatibility with `SortableContext`. Full verification requires resolving the Job Creation issue or running the seed scripts in sequence.
files_changed: ["src/features/applications/components/ApplicantCard.tsx"]
