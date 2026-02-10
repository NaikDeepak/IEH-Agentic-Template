---
status: investigating
trigger: "Job creation fails with Embedding service 404"
created: 2026-02-09T00:00:00Z
updated: 2026-02-09T00:00:00Z
---

## Current Focus

hypothesis: aiService.getEmbedding or gemini.js is throwing a 404, or the route is not correctly matched
test: Read ai.service.js and gemini.js
expecting: See if there's any logic that returns 404
next_action: Read ai.service.js and gemini.js

## Symptoms

expected: Complete the job post form and submit. Redirects to "Manage Jobs". New job appears in the list. Status should be "Active".
actual: fail, installHook.js:1 Error posting job: Error: Embedding service failed: 404 at fetchEmbedding (jobService.ts:35:15)
errors: Error: Embedding service failed: 404
reproduction: Test 4 in UAT
started: Discovered during UAT

## Eliminated

## Evidence

## Resolution

root_cause: 
fix: 
verification: 
files_changed: []
