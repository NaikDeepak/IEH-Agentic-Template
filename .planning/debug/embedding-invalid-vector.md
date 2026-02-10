---
status: investigating
trigger: "Job creation fails with 'Embedding service returned invalid vector'"
created: 2026-02-09T12:00:00Z
updated: 2026-02-09T12:00:00Z
---

## Current Focus

hypothesis: Embedding service response format changed or is returning non-array data.
test: Inspect jobService.ts fetchEmbedding logic and functions/index.js implementation.
expecting: Mismatch between expected and actual response structure.
next_action: Reading jobService.ts and functions/index.js.

## Symptoms

expected: Complete job post form -> Submit -> Redirect to Manage Jobs -> Status Active.
actual: "fail, Error posting job: Error: Embedding service returned invalid vector at fetchEmbedding (jobService.ts:42:15) at async Object.createJob (jobService.ts:73:31) at async handleSubmit (PostJob.tsx:169:7)"
errors: ["Error: Embedding service returned invalid vector"]
reproduction: Submit Job Post form in UI.
started: 2026-02-09

## Eliminated

## Evidence

## Resolution

root_cause:
fix:
verification:
files_changed: []
