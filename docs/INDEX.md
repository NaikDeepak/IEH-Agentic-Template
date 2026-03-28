# WorkMila — Documentation Index

**Single source of truth.** Start here. Every other doc in this repo either feeds into one of the canonical sources below or is marked stale.

---

## Canonical Sources (authoritative, keep up to date)

| Doc | Purpose | Update when |
|-----|---------|-------------|
| [`/CLAUDE.md`](../CLAUDE.md) | Dev commands, architecture overview, env vars, workflow rules, deploy scripts | Stack changes, new commands, architecture changes |
| [`docs/PRD.md`](./PRD.md) | Product vision, personas, key features, business model, success metrics | Product scope changes, new features |
| [`docs/TRD.md`](./TRD.md) | Tech stack, data model, AI integration points, environment matrix | Schema changes, new services, infrastructure changes |
| [`docs/SPRINT_PLAN.md`](./SPRINT_PLAN.md) | Active sprint tasks, status tracking, backlog | Every sprint; update task status as work completes |
| [`docs/feature_gap_analysis.md`](./feature_gap_analysis.md) | Must-have / should-have feature tracker with per-sprint priority | When features ship or priority changes |
| [`docs/STANDARDS.md`](./STANDARDS.md) | Docs-first workflow, folder conventions, PR/code review standards | When process changes |

### Operational References (reference, don't edit frequently)

| Doc | Purpose |
|-----|---------|
| [`docs/firebase-deployment.md`](./firebase-deployment.md) | Full Firebase deployment guide (project setup, Functions, security rules, CI/CD) |
| [`docs/runbook.md`](./runbook.md) | Common ops tasks, troubleshooting, deployment procedures, monitoring |
| [`docs/firebase-quick-reference.md`](./firebase-quick-reference.md) | Firebase CLI quick reference, project switching, emulator setup |
| [`docs/firebase-scaling.md`](./firebase-scaling.md) | Firestore optimization, Functions tuning, cost optimization |

> **Deploy rule (from CLAUDE.md):** Always use `npm run deploy:staging` or `npm run deploy:prod`. Never run `firebase deploy` directly — see `docs/firebase-deployment.md` for why.

---

## Stale — Do Not Use for Development

These files are retained for historical context. Do not rely on them for current state.

| Doc | Reason stale | Current source |
|-----|-------------|----------------|
| [`docs/IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) | References Next.js — project uses Vite + React. Pre-pivot artifact. | `docs/TRD.md`, `CLAUDE.md` |
| [`docs/auth.md`](./auth.md) | Placeholder (21 lines). Only covers Google account-switching edge case. | `CLAUDE.md` (Auth flow section) |
| [`docs/code_review_findings.md`](./code_review_findings.md) | Old review of now-refactored code (`functions/index.js` monolith, `App.tsx` monolith). Items have been addressed or deferred. | `docs/SPRINT_PLAN.md`, `docs/feature_gap_analysis.md` |
| [`docs/cloud_management.md`](./cloud_management.md) | Instructs `firebase deploy --only functions` — **this contradicts CLAUDE.md's explicit rule** to always use the deploy scripts. | `docs/firebase-deployment.md`, `npm run deploy:staging/prod` |
| [`.gsd/STATE.md`](../.gsd/STATE.md) | Last updated 2026-02-20. Phase 7 status snapshot, now superseded. | `docs/SPRINT_PLAN.md` |
| [`.gsd/ROADMAP.md`](../.gsd/ROADMAP.md) | Phase-based roadmap from GSD sessions, no longer updated. | `docs/feature_gap_analysis.md` |
| [`.planning/STATE.md`](../.planning/STATE.md) | Migrated to `.gsd/STATE.md` (itself now stale). | `docs/SPRINT_PLAN.md` |
| [`.planning/ROADMAP.md`](../.planning/ROADMAP.md) | Early planning artifact. | `docs/feature_gap_analysis.md` |

---

## AI Tooling Docs (not development docs)

These files exist to guide AI coding assistants, not human developers. They are not canonical sources for product or architecture decisions.

| Doc | Purpose |
|-----|---------|
| [`/PROJECT_RULES.md`](../PROJECT_RULES.md) | GSD methodology: SPEC→PLAN→EXECUTE→VERIFY→COMMIT protocol for AI sessions |
| [`/GSD-STYLE.md`](../GSD-STYLE.md) | How to write GSD artifacts for AI contributors |
| [`docs/model-selection-playbook.md`](./model-selection-playbook.md) | Routing tasks to Claude haiku/sonnet/opus |
| [`docs/token-optimization-guide.md`](./token-optimization-guide.md) | Token budget guidance for AI interactions |
| [`.gsd/`](../.gsd/) | GSD session state, spec, decisions, journal |
| [`.planning/`](../.planning/) | Planning-phase session artifacts |
| [`.agent/workflows/`](../.agent/workflows/) | Executable slash-command workflow definitions |

---

## Duplicates Removed from `docs/`

The following files were exact copies of root-level files and have been replaced with redirects:

| File | Points to |
|------|-----------|
| [`docs/PROJECT_RULES.md`](./PROJECT_RULES.md) | `/PROJECT_RULES.md` (root) |
| [`docs/GSD-STYLE.md`](./GSD-STYLE.md) | `/GSD-STYLE.md` (root) |

---

## Adding New Documentation

1. Decide which canonical doc it belongs to (update that doc first).
2. If it's a new standalone doc, add a row to this index before merging.
3. If it's a feature-level doc, put it in `docs/features/[feature_name].md` and link from `PRD.md` or `TRD.md`.
4. Mark anything you're replacing as stale in this index.
