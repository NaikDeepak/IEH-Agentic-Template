---
phase: 04-employer-suite
plan: 02
subsystem: Job Posting
tags: [ai, gemini, firestore, jobs]
requires: [04-01]
provides: [ai-job-assist, screening-questions]
tech-stack:
  added: []
  patterns: [AI Integration, Cloud Functions]
key-files:
  created: []
  modified:
    - functions/index.js
    - src/features/jobs/types.ts
    - src/features/jobs/services/jobService.ts
    - src/pages/PostJob.tsx
decisions:
  - date: 2026-02-08
    plan: 04-02
    decision: Automated Company Linking
    rationale: Updated `JobService.createJob` to automatically fetch and link the employer's `company_id` if not explicitly provided, ensuring all jobs are branded.
metrics:
  duration: 5m 3s
  completed: 2026-02-08
---

# Phase 04 Plan 02: AI-Enhanced Job Posting Summary

## Objective
Enhance the job posting experience by integrating AI generation for both descriptions and screening questions, and ensuring all jobs are correctly linked to company branding.

## Deliverables
- **AI Backend Support**: Implemented `generateJobAssistHandler` in Cloud Functions using Gemini 2.0 Flash to provide screening questions and JD optimization suggestions.
- **Smart Schema**: Updated `JobPosting` and `CreateJobInput` types to include `company_id` and `screening_questions`.
- **AI-Powered UI**: Integrated AI assistance into `PostJob.tsx`, allowing employers to generate descriptions, receive JD suggestions, and automatically populate screening questions.
- **Auto-Branding**: Enhanced `JobService` to automatically associate new jobs with the poster's company profile.

## Deviations from Plan

### Auto-fixed Issues
- **[Rule 1 - Bug] Lint & Type Safety**: Fixed several linting errors in `PostJob.tsx` related to unsafe `any` assignments from API responses and accessibility (label-control associations).
- **[Rule 1 - Bug] Service logic**: Updated `getJobsByCompanyId` to correctly use the new `company_id` field instead of the previously assumed `employer_id`.

## Decisions Made
- **Client-Side/Function Split**: Decided to keep JD generation on the existing `/ai/generate-jd` endpoint but introduced a combined `/ai/generate-job-assist` for metadata suggestions to minimize round trips.

## Next Phase Readiness
- Job postings are now high-quality and structured.
- The system is ready for the "Applicant Management" phase where these screening questions will be presented to candidates.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
