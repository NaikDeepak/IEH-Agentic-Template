# Technical Requirements Document (TRD): India Employment Hub

## 1. System Architecture
**Type:** Monorepo / Modern Web Application
**Philosophy:** Mobile-First, Performance-Optimized, Modular Components.

## 2. Technology Stack
-   **Frontend:**
    -   **Framework:** Vite (React SPA).
    -   **Language:** TypeScript.
    -   **Styling:** Tailwind CSS 4.0.
    -   **State Management:** React Context / Zustand (if complex).
    -   **Icons:** Lucide React.
-   **Backend / Services:**
    -   **Primary Logic:** Node.js (Express) on Cloud Run / App Hosting.
    -   **Auth & Database:** Google Firebase (Auth, Firestore).
    -   **AI Engine:** Google Gemini API (`gemini-2.0-flash`).
    -   **Automation:** n8n (Webhooks).
-   **Monitoring:** Sentry (Error tracking).

## 3. Data Model (High-Level Schema)

### 3.1. Users (Collection)
-   `uid` (String)
-   `role` ('admin' | 'employer' | 'candidate')
-   `sub_role` ('owner' | 'recruiter' | 'hiring_manager' | null)
-   `organization_id` (Ref - for employers)
-   `last_active_at` (Timestamp)
-   `status` ('ACTIVE' | 'PASSIVE')

### 3.2. Organizations (Employers)
-   `id`
-   `name`, `branding_assets`
-   `tier` ('basic' | 'growth' | 'enterprise')
-   `members` (Array of UIDs)

### 3.3. Profiles (Candidates)
-   `uid` (Ref)
-   `skills` (Array)
-   `resume_url` (String)
-   `parsed_data` (Object - AI extracted)
-   `ats_score` (Number)

### 3.4. JobPostings (Employers)
-   `employer_id` (Ref)
-   `title`, `description`
-   `status` ('ACTIVE' | 'PASSIVE' | 'CLOSED')
-   `created_at`, `last_action_at`

### 3.5. Applications
-   `job_id`, `candidate_id`
-   `status` ('APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED')
-   `ai_score` (Number)

## 4. AI Integration Points

### 4.1. JD Generator
-   **Input:** Role Title, Skills, Experience.
-   **Model:** `gemini-2.0-flash`.
-   **Output:** Structured Job Description markdown.

### 4.2. Resume Analyzer
-   **Input:** PDF text content.
-   **Model:** `gemini-2.0-flash-thinking` (for deep analysis).
-   **Output:** JSON { match_score, keywords_missing, suggestions }.

### 4.3. Interview Coach
-   **Input:** Job Context + Candidate Resume.
-   **Interaction:** Chat-based mock interview session.
-   **Latency Strategy:** Streaming responses for real-time feel.

## 5. Environment Strategy

### 5.1. Environment Matrix

| Environment | Firebase Project | Activated by |
|---|---|---|
| Local dev | Firebase Emulator (no cloud) | `.env.local` with `VITE_USE_FIREBASE_EMULATOR=true` |
| Staging (cloud) | `india-emp-hub-dev` | `.env.staging` + `firebase use staging` |
| Production | `india-emp-hub` | `.env.production` + `firebase use default` |

### 5.2. Local Development (Emulator)

Run `npm run dev:full:emulator` to start the full stack against local emulators. The emulator auto-imports/exports seed data from `firebase-export/` so state persists between runs.

`firebase-export/` contains committed seed data to ensure a consistent development state. The subdirectories (`firestore_export/`, `auth_export/`) are tracked in git.

### 5.3. Deployment

```bash
npm run deploy:staging   # firebase use staging → build → deploy to india-emp-hub-dev
npm run deploy:prod      # firebase use default → build → deploy to india-emp-hub
```

Staging deploys on `feature/*` → `main` merges (CI). Production deploys are manual / release-gated.

### 5.4. Environment Files (never commit)

- `.env.local` — local overrides, typically just `VITE_USE_FIREBASE_EMULATOR=true`
- `.env.staging` — staging Firebase project credentials
- `.env.production` — production Firebase project credentials
- `.env.example` — committed template documenting all required vars (base Firebase config + emulator toggles/hosts/ports)

## 6. Security & Compliance
-   **RBAC:** Strict access control via Firebase Security Rules / RLS.
-   **AI Security:** All AI calls are proxied through server-side Cloud Functions. **Client-side API keys are strictly forbidden.**
-   **Data Privacy:** User data isolated; explicit consent for AI processing.

## 7. Secure AI Proxy Architecture
-   **Endpoint Root:** `/api/ai/*`
-   **Authentication:** Firebase ID Token (JWT) in `Authorization` header.
-   **Rate Limiting:** 100 requests / 15 minutes per user.
-   **Implementation:** See `architecture.md` for full breakdown.

## 6. Implementation Strategy
1.  **Phase 1:** Skeleton App + Auth + Landing Page.
2.  **Phase 2:** Database Setup + Core "Active" Logic.
3.  **Phase 3:** Employer Side (Post Job + AI Generative tools).
4.  **Phase 4:** Candidate Side (Profile + AI Analysis).
5.  **Phase 5:** Matching Engine & Inactivity Workers (n8n).
