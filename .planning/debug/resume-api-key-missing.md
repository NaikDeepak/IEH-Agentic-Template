---
status: investigating
trigger: "ATS Score and detailed feedback appear after upload. Actual: Failed to analyze resume. Please try again. API key is missing. Please provide a valid API key."
created: 2026-02-11T12:00:00Z
updated: 2026-02-11T12:15:00Z
---

## Current Focus

hypothesis: The client-side code is looking for VITE_GEMINI_API_KEY, but the environment variable is named GEMINI_API_KEY in .env. Vite only exposes variables prefixed with VITE_ to the client.
test: Confirmed via inspection of .env and client-side services.
expecting: Root cause confirmed.
next_action: Report findings.

## Symptoms

expected: Upload resume -> Wait -> See ATS score and feedback.
actual: Error "Failed to analyze resume. Please try again. API key is missing. Please provide a valid API key."
errors: "Failed to analyze resume. Please try again. API key is missing. Please provide a valid API key."
reproduction: Upload a resume (PDF/DOCX) on Dashboard or Profile.
started: UAT Test 2

## Eliminated

## Evidence

- timestamp: 2026-02-11T12:05:00Z
  checked: src/features/seeker/services/resumeService.ts
  found: The service initializes GoogleGenAI with (import.meta.env.VITE_GEMINI_API_KEY as string) || "".
  implication: If the env var is missing, it defaults to an empty string, which the SDK rejects.
- timestamp: 2026-02-11T12:06:00Z
  checked: .env.example
  found: VITE_GEMINI_API_KEY is missing from the example environment file.
  implication: Developers or testers following the example will not know to set this key.
- timestamp: 2026-02-11T12:07:00Z
  checked: Other services (interviewService.ts, networkingService.ts, etc.)
  found: They all use VITE_GEMINI_API_KEY similarly.
  implication: Systemic issue affecting all AI features in seeker tools.
- timestamp: 2026-02-11T12:10:00Z
  checked: .env
  found: GEMINI_API_KEY is present, but VITE_GEMINI_API_KEY is missing.
  implication: Vite only exposes variables prefixed with VITE_ to the client side. The client receives an empty string for VITE_GEMINI_API_KEY.

## Resolution

root_cause: The client-side AI services (e.g., resumeService.ts, interviewService.ts) expect VITE_GEMINI_API_KEY. However, the .env file defines it as GEMINI_API_KEY. Vite security policy only exposes environment variables prefixed with VITE_ to the browser. Consequently, the API key is passed as an empty string to the GoogleGenAI SDK, leading to the reported error. Furthermore, .env.example is missing this variable entirely, making it difficult for other environments to be configured correctly.
fix:
verification:
files_changed: []
