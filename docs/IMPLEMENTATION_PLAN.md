# Implementation Plan: India Employment Hub

## Goal Description
Build a "Visionary" MVP of India Employment Hub, an AI-first recruitment platform replicating key features of Jobright.ai but tailored for the Indian market with a unique "Active" mechanics system.

## User Review Required
> [!IMPORTANT]
> **Tech Stack Confirmation**: This plan assumes Next.js (App Router), Firebase (Auth/Firestore), and Tailwind CSS.
> **Documentation First**: All development will follow the `docs/STANDARDS.md` protocol.

## Proposed Changes (Work Breakdown Structure)

### Phase 1: Foundation & Setup
#### [NEW] Project Initialization
- [x] Initialize Next.js project with TypeScript.
- [x] Configure Tailwind CSS and generic Design System.
- [x] Setup `docs/` structure (Accomplished).

#### [NEW] Authentication
- [x] Document Auth Plan in `docs/features/auth.md`.
- [x] Implement `AuthController` for handling Sign Up / Sign In.
- [x] Create `AuthContext` to manage user sessions.

### Phase 2: Core Platform UI (Frontend)
#### [NEW] Landing Page
- [ ] Document Landing Page Specs in `docs/features/landing.md`.
- [ ] **Hero Section**: High-impact "Vision" slider/video.
- [ ] **Problem/Solution**: Interactive components.
- [ ] **Feature Highlights**: Cards for Active System, AI Assistant.

#### [NEW] Layouts
- [ ] **Employer Dashboard Layout**: Sidebar nav, top bar.
- [ ] **Candidate Dashboard Layout**: Top nav, profile progress.

### Phase 3: The "Active" System Backend
#### [NEW] Data Layer
- [ ] Define Firestore Security Rules for `users`, `jobs`, `applications`.
- [ ] Implement `JobService` to create/update jobs.

#### [NEW] Activity Logic
- [ ] Create "Activity Tracker" hooks.
- [ ] **[Automation]** Logic for "Passive" status switch.

## Verification Plan

### Automated Tests
-   **Unit Tests**: Test `getMatchScore(candidate, job)` logic.
-   **E2E**: Verify Auth Flow (Sign up -> Land on Dashboard).

### Manual Verification
-   **"Active" Logic**: Manually set `last_active_at` inactive and verify status flip.
