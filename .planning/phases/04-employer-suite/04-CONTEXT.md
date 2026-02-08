# Phase 4: Employer Suite - Context

**Gathered:** 2026-02-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Productivity tools for job creation and candidate management. Includes AI-powered JD and screening question generation, a Kanban-based ATS pipeline for applicant tracking, and an employer branding profile editor. Focus is on employer productivity and candidate management efficiency.

</domain>

<decisions>
## Implementation Decisions

### AI Generation Experience
- **Interaction:** Structured Form Input (Title, Skills, Exp) -> AI fills fields -> User edits.
- **Review:** Immediate Edit mode (users see AI output and edit directly).
- **Screening Questions:** Auto-generated alongside the JD based on the same inputs.
- **Prompting:** Single standard prompt for all roles (no complex tone selection for MVP).

### ATS Pipeline Workflow
- **Stages:** Fixed Standard Stages (Applied -> Screening -> Interview -> Offer -> Hired/Rejected).
- **Interface:** Kanban Board with drag-and-drop columns.
- **Automation:** Manual drag-and-drop only (no auto-reject rules yet).
- **Card Design:** Compact cards displaying Name, Match Score, and Current Role.

### Employer Branding Page
- **Structure:** Structured Sections (About Us, Culture, Benefits, Location, Tech Stack).
- **Visibility:** Dedicated standalone public page (e.g., `/companies/{id}`).
- **Media:** Basic Branding only (Logo and Cover Image).
- **Editing:** Dedicated "Company Profile" editor page (separate from settings).

### Job Dashboard Structure
- **Organization:** List view filtered by status (Active/Draft/Closed) with quick stats.
- **Metrics:** Activity Metrics per job (Total Applicants, Unread count, Days Open).
- **Actions:** Split Action (Click title to Edit, Click Applicant Count to view pipeline).
- **Visibility:** Personalized View (Recruiters see "My Jobs" vs "Company Jobs").

### Claude's Discretion
- Exact layout of the AI generation form.
- Visual design of the Kanban board (colors, spacing).
- Specific copy for the fixed pipeline stages.
- Error handling for AI generation failures.

</decisions>

<specifics>
## Specific Ideas

- Kanban board should feel snappy and responsive.
- AI generation should be a "drafting assistant" experience, not a "chat bot".
- Employer profile should look professional and clean, highlighting key info without clutter.

</specifics>

<deferred>
## Deferred Ideas

- Custom pipeline stages per job.
- Advanced workflow automation (auto-reject).
- Rich media gallery for company profiles (videos, photo carousels).
- Multi-option AI generation (pick from 3 variants).
- Role-specific tone settings for JDs.

</deferred>

---

*Phase: 04-employer-suite*
*Context gathered: 2026-02-08*
