# Architecture: IEH Platform

## AI Service Architecture (Secure Proxy)

The application uses a **Secure AI Proxy** pattern to protect sensitive API keys (like the Gemini API Key) from exposure in the client-side bundle.

### Design Principles
1.  **Zero Client-Side Keys**: No `VITE_` prefixed environment variables are used for AI services.
2.  **Authenticated Requests**: All AI features require a valid Firebase ID token.
3.  **Server-Side Execution**: Gemini API calls are executed within Cloud Functions, where the `GEMINI_API_KEY` is securely stored as a secret.

### Components
- **Frontend Services**: (`resumeService.ts`, `interviewService.ts`, etc.) call a shared `callAIProxy` utility.
- **`callAIProxy` Utility**: Handles Firebase authentication, injects the Bearer token, and routes requests to the Cloud Function.
- **Cloud Functions (`functions/index.js`)**: 
    - Mounts AI proxy routes under `/api/ai/*`.
    - Implements **Rate Limiting** via `express-rate-limit`.
    - Verifies user authentication.
- **AI Handlers (`functions/src/ai/handlers/`)**: Feature-specific logic for processing requests and enforcing JSON schemas.

## Growth & Referral Architecture

The referral and rewards system uses a **Secure Backend + Atomic Ledger** pattern.

### Components
- **`src/features/growth/services/referralService.ts`**: Generates unique `IEH-[6-CHAR]` codes, links referrals via `referredBy` field, triggers rewards on first application.
- **`src/features/growth/services/ledgerService.ts`**: Atomic Brownie Points ledger using `runTransaction` for balance integrity with full audit trail in `ledger` collection.
- **Cloud Function `getReferrals`**: Backend API to query referral data securely, enforcing privacy by preventing direct client-side profile reads.
- **UI Components**: `ReferralDashboard`, `PointsBadge`, `PhoneVerification`, `LinkedInVerification`.

### Verification Services (Currently Simulated)
- **Phone OTP**: Simulated in dev; production will use Firebase Phone Auth with `RecaptchaVerifier`.
- **LinkedIn**: Simulated profile URL capture; production will use LinkedIn OAuth2 via Firebase Identity Platform.

## Job Search & Ranking Architecture

The job search uses a **Hybrid Semantic + Filtered Ranking** pattern to provide both relevance and precision.

### Components
- **Vector Search**: Uses `gemini-embedding-001` to generate a 768-dimension embedding of the search query. Firestore `findNearest` is used for the initial candidate retrieval.
- **Multimodal Filtering**: Filters for `work_mode`, `city`, `job_type`, and `experience_level` are applied both server-side (for total accuracy) and client-side (for immediate feedback).
- **Hybrid Ranking Algorithm**: Calculates a `matchScore` based on three weighted signals:
    1.  **Semantic Vector Match (55%)**: Conceptual relevance of the query to the job description.
    2.  **Keyword Match (20%)**: Literal overlap of search terms with job title and skills.
    3.  **Explicit Filter Bonus (25%)**: A boost given to results that match user-selected filter criteria (City, Job Type, etc.), ensuring filtered results rank at the top.

## Data Robustness & Validation

The platform implements a **Safe Data Normalization** pattern at the service layer to handle "thin" or legacy Firestore documents.

### Implementation
- **Service-Level Defaults**: `ProfileService.getProfile` and `getLatestResume` (in `resumeService.ts`) inject default empty objects and arrays (e.g., `preferences.roles: []`, `keywords.found: []`) during the data fetch.
- **Optional Chaining**: UI components like `InterviewPrep.tsx` use deep optional chaining and nullish coalescing for all nested properties, ensuring the app remains functional even if backend synchronization is partial.
- **Type Safety**: Normalization is performed before casting to domain types, ensuring runtime reality matches TypeScript interface expectations.

## Technical Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS.
- **Backend**: Firebase Cloud Functions (Node.js/Express).
- **Database**: Firestore.
- **AI**: Google Gemini API (via server-side `@google/genai`).
- **Security**: 
    - Firebase Auth.
    - Rate Limiting (100 requests per 15 min for AI endpoints).
    - CORS tightening to production domains.
    - Helmet security headers in Vercel/Express server.
