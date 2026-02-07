# Phase 2: Marketplace Mechanics - Context

**Gathered:** 2026-02-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement the "Active System" logic to ensure platform freshness. This involves tracking activity for jobs and candidates, enforcing 4-day timeouts, and handling the consequences of inactivity (ranking drops, notifications).

</domain>

<decisions>
## Implementation Decisions

### Expiration Triggers & Scope
- **Candidates:** Simple login resets the 4-day timer. (Login = Active).
- **Employers:** Activity is tracked **per job**, not account-wide. Viewing applications or editing a specific job resets the timer for *that job*.
- **API Strategy:** Logic must be exposed via API endpoints (reusable for future mobile app), not just embedded in frontend components.

### Notifications & Visibility
- **Pre-Expiration Warning:** Send email notification 24 hours before expiration ("Your job/profile will become passive soon").
- **Dashboard UI:** Explicitly show the "Active" status and time remaining (e.g., "Active (expires in 2 days)").

### Reactivation Flow
- **Implicit:** No "Reactivate" button needed. Performing the standard active action (logging in for candidates, viewing apps for employers) automatically restores Active status.

### Consequences of Passivity
- **Ranking:** Passive items (candidates or jobs) are not hidden, but **drop to the bottom** of search results/rankings.
- **Labeling:** Clearly distinguished as "Passive" in the UI? (implied by "Show Status", but ranking is the primary functional penalty).

### Claude's Discretion
- Exact email copy/template.
- Visual design of the "Active/Passive" badges and timers.
- Technical implementation of the scheduler (Cloud Scheduler vs. other methods).

</decisions>

<specifics>
## Specific Ideas

- "Create an API endpoint which can be used later for both webapp and mobile app"
- "Drop below in ranking" — immediate consequence of 4-day timeout.

</specifics>

<deferred>
## Deferred Ideas

- Mobile App implementation (future phase).

</deferred>

---

*Phase: 02-marketplace-mechanics*
*Context gathered: 2026-02-07*
