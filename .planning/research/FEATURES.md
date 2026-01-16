# Feature Landscape: AI Job Board v2 (2026)

**Researched:** 2026-01-16
**Domain:** AI-Powered Recruitment & Career Management
**Confidence:** HIGH (Regulatory/Core Tech), MEDIUM (Agentic Trends)

## Executive Summary

The AI job board landscape in 2026 has shifted from "search" to "agentic matching." Top platforms no longer just show jobs; they proactively manage careers for candidates and automate discovery for recruiters. The introduction of the EU AI Act and local regulations (like NYC Local Law 144) has made **Explainability** and **Bias Mitigation** table stakes, while **Autonomous Career Agents** are the primary differentiator.

---

## 1. Table Stakes (v2 Requirements)

Features that are mandatory for any competitive AI platform in 2026.

| Feature | Category | Complexity | Rationale |
|---------|----------|------------|-----------|
| **Bi-directional Semantic Matching** | Matching | Medium | Moving from "Job-to-Candidate" to simultaneous "Candidate-to-Job" and "Market-to-Skill" matching. |
| **Explainable Scoring (XAI)** | Scoring | High | Regulatory requirement (EU AI Act). Users must know *why* they were scored a certain way. |
| **Bias Mitigation Filters** | Compliance | Medium | Mandatory technical audits for bias (NYC LL144). Features must strip PII during initial AI scoring. |
| **Real-time Skill Gap Analysis** | Scoring | Medium | Candidates expect to see exactly which skills they lack for a specific high-match role. |
| **Conversational Discovery** | UX/Search | Medium | Natural language interface for both recruiters ("Find me a junior dev who knows Rust") and candidates. |

---

## 2. Differentiators (Competitive Advantage)

Features that will set IEH apart from legacy boards like LinkedIn or Indeed.

| Feature | Category | Complexity | Impact |
|---------|----------|------------|--------|
| **Autonomous Career Agents** | Agentic | Very High | Agents that proactively network, suggest skill upgrades, and draft tailored applications. |
| **Predictive Career Pathing** | Career | High | AI that maps a 5-year trajectory based on current role, identifying the "stepping stone" jobs needed. |
| **Simulated Interview Prep** | Agentic | Medium | Role-specific voice/video AI interviewers that provide real-time feedback based on the job description. |
| **Verified Skill Proofs (AI-Vetted)** | Scoring | Medium | AI-driven technical assessments that "vouch" for skills, reducing the need for initial recruiter screening. |
| **Salary/Market Real-time Index** | Data | Medium | Hyper-local, real-time salary insights based on current AI-matched demand, not stale surveys. |

---

## 3. Anti-Features

Things to deliberately NOT build to avoid legal, ethical, or UX failure.

| Anti-Feature | Rationale |
|--------------|-----------|
| **Black-Box Ranking** | Avoid entirely. Any ranking without a "View Why" component is a legal liability under 2026 AI laws. |
| **Automated "Ghost" Applications** | Agents applying to 100s of jobs without user review. This destroys platform quality and triggers recruiter spam filters. |
| **Video Emotion AI** | Analyzing candidate "sentiment" or "emotions" via video. High risk of bias and currently being regulated/banned in many jurisdictions. |
| **Social Media Scraping for "Culture Fit"** | Leads to high demographic bias and privacy concerns. Stick to professional data. |
| **Gender/Age-Based Recommendation Weighting** | Even if "historical data" suggests it, explicitly program against these weights. |

---

## 4. Feature Detail: Career Agents

The core of the v2 experience.

### Agentic Behavior Expected in 2026:
- **Active Monitoring:** The agent doesn't wait for the user to login. It monitors the market 24/7.
- **Proactive Tailoring:** Instead of a generic resume, the agent drafts a "Why I'm a match" summary for every job.
- **Dependency Management:** The agent manages the candidate's calendar for interviews and follow-ups.

---

## 5. Complexity & Dependencies

### Critical Dependencies:
1. **Explainability Engine -> Scoring:** You cannot launch v2 scoring without the "Reasoning" module that explains the score to the user.
2. **Vector DB (Existing) -> Bi-directional Matching:** Requires upgrading existing embeddings to handle much higher dimensions for better nuance.
3. **Agent Logic -> Compliance:** Autonomous agents must have "kill switches" and explicit user consent logs for every external action.

### Complexity Map:
- **Low:** Conversational search (Wrapper over LLM).
- **Medium:** Skill gap analysis, Bias filters.
- **High:** Explainable AI (XAI) architecture, Bi-directional matching.
- **Very High:** Fully autonomous career agents (Multi-step reasoning/actions).

---

## Sources

### Primary (HIGH confidence)
- **EU AI Act (2024/2026 Compliance):** Requirements for "High-Risk AI" in recruitment.
- **NYC Local Law 144:** Mandatory bias audit documentation.
- **Stanford HAI AI Index 2025:** Trends in agentic workflows.

### Secondary (MEDIUM confidence)
- **LinkedIn/Indeed 2025 Feature Roadmaps:** Public announcements regarding "AI hiring assistants."
- **Gartner Hype Cycle for HR Tech 2025:** Autonomous agents identified as "Peak of Inflated Expectations" moving to "Slope of Enlightenment."

### Tertiary (LOW confidence)
- **Community "AI Recruiter" GitHub Repos:** Patterns for autonomous job application agents (experimental).

## Metadata
**Research Date:** 2026-01-16
**Valid Until:** 2026-07-16 (Fast-moving agentic space)
