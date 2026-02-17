# Phase 07: Stabilization & Production Readiness - Context

## Overview
Phase 07 hardens the platform for real users. All v1 features are built and passing UAT; this phase focuses on non-functional quality: observability, security, performance, usability, and deployment automation.

## Scope

### In Scope
1. **Sentry Enhancement** — Logging integration, server-side span tracing, production sample rate tuning.
2. **E2E Smoke Tests** — Playwright tests for critical user paths.
3. **Firestore Security Audit** — Deny-by-default rules, write validation, rules unit tests.
4. **Performance & Accessibility** — Lighthouse ≥ 90, WCAG AA, mobile responsiveness.
5. **Error Handling Hardening** — Zero empty catches, loading/error UI states, offline resilience.
6. **CI/CD Pipeline** — GitHub Actions for lint → typecheck → test → build → deploy preview.
7. **SEO & Meta Tags** — OG tags, structured data (JSON-LD for JobPosting), robots.txt, sitemap.
8. **API Security Headers** — Helmet, CORS lock-down, rate limiting expansion, Zod input validation.
9. **Environment & Deployment** — Dev/staging/prod separation, Firebase hosting headers, backup strategy, production checklist.
10. **UX Polish** — Skeleton loading, empty states, toast notifications, form validation UX.

### Explicitly Out of Scope
- **Real Phone OTP** — Stays simulated until funding is secured.
- **Real LinkedIn OAuth** — Stays simulated until funding is secured.
- **Monetization / Payments** — Deferred to post-funding.
- **v2 features** (Career Agents, XAI, Predictive Pathing) — Deferred indefinitely.

## Scope Guardrails
- **No new features.** This phase only improves what exists.
- **Every plan must leave the codebase measurably better** (test count, Lighthouse score, Sentry coverage, security scan).
