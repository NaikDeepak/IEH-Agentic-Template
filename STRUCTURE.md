# Project Structure & Architecture Map

This file provides a high-fidelity map of the IEH Platform to catalyze architectural discovery and reduce context overhead.

## 1. Core Directories

- **`src/features/`**: Business logic partitioned by domain.
  - `admin/`: Platform costing and usage stats.
  - `applications/`: Employer Kanban boards for pipeline management.
  - `candidates/`: Candidate search and filters for employers.
  - `companies/`: Employer profiles and branding.
  - `growth/`: Viral referral logs, ledger, and point-based reward systems.
  - `jobs/`: Job board listings, matching, and semantic search.
  - `seeker/`: Resume analyzer, skill analysis, and interview tools.
- **`src/lib/`**: Foundational utilities.
  - `ai/`: **Secure Proxy Client** (`callAIProxy`) and Gemini service layer.
  - `firebase.ts`: Global initialization of Auth and Firestore.
- **`src/server/`**: Express-based AI Proxy Server (entry: `index.js`).
  - Implements Bearer token validation and rate limiting.
- **`functions/`**: Cloud Functions for background tasks and referral logic.
- **`docs/`**: Active project specifications (`PRD.md`, `TRD.md`, `changelogs/`).
- **`scripts/`**: CI/CD tools, deployment validators, and seeding scripts.

## 2. Key Architecture Patterns

- **Secure AI Proxy**: No client-side API keys. All GenAI calls routed via Express server.
- **Active System**: Rules-based profile/job "expiry" (4-day rule).
- **Hybrid Ranking**: Weighted scoring (Vector 55%, Keywords 20%, Filters 25%).
- **Points Ledger**: Atomic Firestore transactions for growth mechanics.

## 3. Technology Alignment

- **Frontend**: React 19, Vite 6, Tailwind 4, Sentry, Vitest.
- **Backend**: Node.js 22, Express, Firebase Admin/Functions.
- **AI**: Gemini 2.0 Flash (Default), Gemini Embeddings.
