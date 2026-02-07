# Phase 3: Semantic Matching Engine - Context

**Gathered:** 2026-02-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Intelligent bi-directional matching between candidates and jobs using vector search. Candidates see relevant jobs based on semantic fit. Employers see candidates ranked by experience, skills, and context. Matches reflect understanding of India IT/ITES/BPO domain. This phase is the matching engine — not search filters, not ATS pipeline, not messaging.

</domain>

<decisions>
## Implementation Decisions

### Match Result Presentation
- Qualitative labels, not numeric scores: **Strong Match / Good Match / Potential Match**
- Show skill gaps prominently to encourage awareness (no hiding)
- Filter out poor-fit matches entirely — only show Potential or better
- Claude's discretion: match reason formatting, visual treatment, exact threshold logic, color coding

### Candidate Job Discovery
- Matched jobs integrated into main job feed (no separate "For You" page)
- Default sort: **Recency first**, with match quality as secondary factor
- Cold start handling: Show generic/trending jobs + prompt to complete profile for better matches
- Claude's discretion: when/how match badges appear in feed

### Employer Candidate Ranking
- View modes: **Candidate cards and sortable table** — user can toggle between views
- Match label (Strong/Good/Potential) **always visible** on candidates
- **Side-by-side comparison** for 2-3 candidates
- **Full bulk actions**: Select multiple candidates for shortlist/reject/message
- Default sort: **Match score first** (best fits at top)
- Active/Passive status: **Prominent badge** on each candidate
- **Full inline actions**: Shortlist, Message, Reject available without opening profile
- **Team-visible notes**: Employers can add notes on candidates visible to their team

### India Domain Tuning
- Title variations: **Keep distinct titles, match smart** — understand "SDE" = "Software Engineer" equivalence for matching without normalizing display
- City handling: **City name only** — no tier-city classification
- Company type: **User-stated preference** — candidates specify preferred company type (Service/Product/Startup) in profile
- BPO/KPO: **Distinct verticals** — treat as separate from general IT with their own matching logic

### Claude's Discretion
- Match reason formatting (chips vs summary sentence vs both)
- Visual card/row design and density
- Exact quality threshold for filtering
- Color coding approach for match labels
- Match badge visibility rules in job feed

</decisions>

<specifics>
## Specific Ideas

- Skill gaps should be shown to create upselling opportunity for courses/learning resources (deferred to monetization phase)
- "Strong Match / Good Match / Potential Match" — these exact terms for labeling

</specifics>

<deferred>
## Deferred Ideas

- **Course upsell for skill gaps** — Show gaps prominently, then offer free/paid courses from sponsors to help candidates upskill. This is monetization territory (Phase 6).

</deferred>

---

*Phase: 03-semantic-matching-engine*
*Context gathered: 2026-02-08*
