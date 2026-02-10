---
status: diagnosed
trigger: "ATS Kanban Board Navigation Missing"
created: 2026-02-10T10:00:00Z
updated: 2026-02-10T10:05:00Z
goal: find_root_cause_only
symptoms_prefilled: true
---

## Current Focus

hypothesis: The "View Applicants" link is missing because there is no UI element linking to the applicant pipeline route, and the "Manage Jobs" navigation points to a public page.
test: Verified App.tsx routes, Header.tsx links, and JobCard.tsx content.
expecting: Found that JobApplicants page exists but is unreachable via UI.
next_action: Return diagnosis.

## Symptoms

expected: User should be able to click "View Applicants" on a job to see the Kanban board.
actual: User asked "from which screen I can check this", indicating the navigation is missing or non-obvious.
errors: None.
reproduction: Navigate to Employer Job Dashboard (Manage Jobs) and look for navigation to the applicant Kanban board.
started: UAT Test 5.

## Eliminated
- hypothesis: The route for the Kanban board doesn't exist.
  evidence: Route exists in App.tsx: /employer/jobs/:id/applicants.
  timestamp: 2026-02-10T10:02:00Z

## Evidence
- timestamp: 2026-02-10T10:03:00Z
  checked: src/components/Header.tsx
  found: "Manage Jobs" links to /jobs, which is the public jobs page.
  implication: Employers are sent to the general jobs list instead of a management dashboard.
- timestamp: 2026-02-10T10:04:00Z
  checked: src/components/JobCard.tsx
  found: Only contains "View Details" action. No conditional "View Applicants" button for owners.
  implication: Even on the jobs list, there is no way to reach the applicant pipeline.
- timestamp: 2026-02-10T10:05:00Z
  checked: src/pages/employer/JobApplicants.tsx
  found: The page is fully implemented with a KanbanBoard component.
  implication: The feature is ready but the "door" to it is missing.

## Resolution

root_cause: The "View Applicants" navigation is missing because: 1) The "Manage Jobs" header link incorrectly points to the public `/jobs` page instead of a filtered employer view. 2) The `JobCard` component lacks an action button for employers to view applicants for their own jobs.
fix:
verification:
files_changed: []
