# Phase 5: Seeker Tools - Context

**Gathered:** 2026-02-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Empower job seekers with AI-driven tools to analyze resumes, track applications, and identify skill gaps. This phase focuses on the "preparation and management" side of the seeker experience.

**Scope Adjustment:** While the roadmap originally included Interview Prep (SEEK-03) and Skill Assessments (SEEK-04), the user has explicitly requested to defer these to a later phase ("None in phase 1"). Focus is on Resume Analysis, Application Tracking, Smart Shortlists, and Skill Gap Analysis.

</domain>

<decisions>
## Implementation Decisions

### Resume Analysis Experience
- **Input:** Multi-source input (Upload + Paste Text + LinkedIn URL import).
- **Output:** General "Health Check" score + Job-Specific Match score.
- **Feedback:** Highlight issues only (e.g., "Missing React keyword") rather than generating full rewrites.
- **Profile Handling:** Claude's discretion on whether to auto-save or require explicit save.

### Smart Job Shortlist
- **Curation Logic:** Matches based on Profile/Resume skills only (not behavioral yet).
- **Update Frequency:** Daily "Top 5" digest (static for 24h) to reduce noise.
- **Interaction:** Claude's discretion on List vs Card Stack.

### Application Tracker
- **Data Source:** Auto-add applied jobs from IEH only (no external job tracking).
- **View:** Kanban board (Applied, Interviewing, Offer, Rejected).
- **Proactivity:** Include follow-up nudges after X days of silence.

### Skill Gap & Learning Loop
- **Analysis Target:** Role-based analysis (e.g., "Senior Frontend Dev") rather than just single-job specific.
- **Content:** Links to external resources (Coursera, Medium, etc.).
- **Action:** Users save gaps to a "Learning Plan" or list.

### Market Data & Insiders
- **Salary:** Show estimated ranges based on market data.
- **Trends:** Basic trend indicators (up/down).
- **Insiders:** Claude's discretion on level of detail (Privacy focused).

### Claude's Discretion
- **Resume Persistence:** Handling the "save to profile" flow for analyzed resumes.
- **Shortlist UI:** Interaction model (List vs Swipe).
- **Insider Privacy:** How much detail to show about alumni/connections.
- **Visual Design:** Specific UI components for the Kanban board and charts.

</decisions>

<specifics>
## Specific Ideas

- "Smart Job Shortlist (Auto-curated)"
- "Application Tracker (Actually Useful)"
- "Skill Gap → Learning Loop (Game-Changer)"
- Users want actionable insights (Issues) but not necessarily AI writing everything for them (Rewrites).
- The "Daily Digest" model suggests a finite, manageable list rather than an endless feed.

</specifics>

<deferred>
## Deferred Ideas

- **Interview Prep (SEEK-03):** User explicitly requested "None in phase 1" for all interview features.
- **Skill Assessments (SEEK-04):** User explicitly requested "None" for assessment features.
- **External Job Tracking:** Tracking jobs from other platforms is out of scope.
- **Behavioral Matching:** Shortlist is profile-based only for now.

</deferred>

---

*Phase: 05-seeker-tools*
*Context gathered: 2026-02-11*
