# Phase 5 Plan 11: Insider Connections Summary

## 1. Overview
Implemented the **Insider Connections** feature (SEEK-06), allowing job seekers to identify potential connections (alumni, ex-colleagues, shared network) at target companies and generate AI-powered outreach messages.

## 2. Key Features
- **Connection Matching Logic:**
  - Identifies **Alumni** (shared education institution).
  - Identifies **Ex-Colleagues** (shared past company).
  - Identifies **Shared Network** (other connections or shared background).
  - Sorts connections by relevance score.
- **AI Outreach Generation:**
  - Generates personalized LinkedIn/Email templates using Gemini 2.0 Flash.
  - Contextualizes message based on connection type (e.g., "Fellow UofT alum...").
  - Supports tone selection (professional, casual, enthusiastic).
- **Insider Connections UI:**
  - Displays list of connections for a specific target company.
  - Visual indicators for connection type (Alumni, Ex-Colleague).
  - integrated "Draft Message" workflow with copy-to-clipboard functionality.

## 3. Technical Details
### Files Created/Modified
- `src/features/seeker/services/networkingService.ts`: Core logic for `findConnections` and `generateOutreachTemplate`.
- `src/features/seeker/components/Networking/InsiderConnections.tsx`: React component for displaying connections and generating drafts.
- `src/features/seeker/types.ts`: Added `Connection` and `OutreachTemplate` interfaces.

### Dependencies
- **Google Generative AI SDK:** Used for drafting outreach messages.
- **Firebase Firestore:** Used to query potential connections (simulated with broad query + in-memory filtering for MVP).

## 4. Decisions Made
| Decision | Rationale |
|---|---|
| **In-Memory Filtering** | For the MVP, we fetch a sample of users and filter for alumni/ex-colleagues in memory. A production version would require a search engine (Algolia) or denormalized `education_schools` array fields for direct Firestore querying. |
| **Generous Matching** | To ensure the UI isn't empty during testing, we include a "Shared Network" fallback if the user works at the target company, even without a strong alumni/work history match. |
| **Profile Requirement** | The feature explicitly requires the current user to have a populated profile (specifically `parsed_data`) to perform matching. |

## 5. Next Steps
- Integrate `InsiderConnections` into the Job Detail view or Company Profile page.
- Implement "Connect" button to link directly to LinkedIn profiles if URL is available.
- Add "Request Referral" specific workflow.
