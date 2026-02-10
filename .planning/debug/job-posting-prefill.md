---
status: investigating
trigger: "we can fetch and update the About us section rather than asking employer to fill as he is already logged in"
created: 2026-02-10T14:00:00Z
updated: 2026-02-10T14:15:00Z
---

## Current Focus

hypothesis: The PostJob form initializes with empty strings and doesn't attempt to fetch existing company data from the logged-in user's profile.
test: Examine src/pages/PostJob.tsx for form initialization and useEffect hooks.
expecting: To find that the form state for company details is empty by default and no fetch logic exists.
next_action: Produce diagnosis report.

## Symptoms

expected: The "About Company" section should be pre-filled with the logged-in user's company information.
actual: The user has to manually enter company details every time they post a job (specifically Location, and currently there is no 'About Company' field at all in the form).
errors: None reported, just a missing feature/UX gap.
reproduction: Log in as an employer, go to "Post Job" page.
started: Always been this way.

## Eliminated

- hypothesis: The service already handles pre-filling.
  evidence: JobService.createJob fetches the company_id but does not pull descriptive fields into the job document itself, nor does the frontend fetch them for the form.
  timestamp: 2026-02-10T14:10:00Z

## Evidence

- timestamp: 2026-02-10T14:05:00Z
  checked: src/pages/PostJob.tsx
  found: The `formData` state initializes `location` to an empty string (line 31). There is no `useEffect` hook to fetch company data.
  implication: The form starts empty and never updates based on the user's existing company profile.

- timestamp: 2026-02-10T14:08:00Z
  checked: src/features/jobs/types.ts
  found: The `JobPosting` and `CreateJobInput` interfaces do not have a field for "About Company" or "Company Bio".
  implication: To support "fetching and updating the About us section" for a job post, the schema needs to be expanded to store this data per job, or it must be pulled dynamically during display.

- timestamp: 2026-02-10T14:12:00Z
  checked: src/features/companies/services/companyService.ts
  found: `CompanyService.getCompanyByEmployerId(uid)` exists and can be used to fetch the profile.
  implication: The infrastructure to fix this is already present in the services layer.

## Resolution

root_cause: The `PostJob.tsx` component lacks a initialization effect to fetch the employer's company profile. Additionally, the job posting schema and form currently do not include a dedicated "About Company" field, which the user expects to be present and pre-filled from their profile.
fix:
  1. Update `src/features/jobs/types.ts` to include `company_bio?: string` in `JobPosting` and `CreateJobInput`.
  2. In `src/pages/PostJob.tsx`, add a `useEffect` to fetch the company profile using `CompanyService.getCompanyByEmployerId(user.uid)` on mount.
  3. Update `formData` and the UI in `PostJob.tsx` to include an "About Company" textarea, pre-filled with the fetched `company.bio`.
  4. Pre-fill `formData.location` from `company.location` during the same effect.
verification:
files_changed: [/Users/deepaknaik/Downloads/1. AI Live/IEH/src/features/jobs/types.ts, /Users/deepaknaik/Downloads/1. AI Live/IEH/src/pages/PostJob.tsx]
