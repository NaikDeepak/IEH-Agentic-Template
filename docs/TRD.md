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

## 5. Security & Compliance
-   **RBAC:** Strict access control via Firebase Security Rules / RLS.
-   **Data Privacy:** User data isolated; explicit consent for AI processing.

## 6. Implementation Strategy
1.  **Phase 1:** Skeleton App + Auth + Landing Page.
2.  **Phase 2:** Database Setup + Core "Active" Logic.
3.  **Phase 3:** Employer Side (Post Job + AI Generative tools).
4.  **Phase 4:** Candidate Side (Profile + AI Analysis).
5.  **Phase 5:** Matching Engine & Inactivity Workers (n8n).
