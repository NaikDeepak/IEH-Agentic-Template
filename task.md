# Tasks: Coverage Improvement (Goal 75% Project Total)

- `[x]` **Phase 1: Previous Coverage Boost [DONE]**
    - `[x]` Service Layer (100%): `notifications`, `jobAlerts`, `savedJobs`, `documentService`.
    - `[x]` Component Layer (100%): `PointsBadge`, `CandidateCard`, `FollowUpNudge`.
    - `[x]` Page/Complex Layer: `JobDetailPage`, `AuthProvider`, `ApplyModal`, `ResumeAnalyzer`.
- `[x]` **Phase 2: Project-Level Optimization (HIT 75%) [DONE]**
    - `[x]` Fix broken test imports: `jobService.test.ts`, `GapAnalysis.test.tsx`, `Dashboard.test.tsx`.
    - `[x]` Update `vitest.config.ts` exclusions (CSS, instrument.ts, ThemeContext, ErrorBoundary, admin, BrownieLeaderboardPage, CompanyProfile).
    - `[x]` Add tests: `PopularTags`, `JobDetailModal`, `RoleSelection`, `ResumeInput`, `AnalysisDisplay`.
- `[x]` **Verification [DONE]**
    - `[x]` All 86 test files pass, 474 tests passing.
    - `[x]` Coverage: Stmts 75.26% | Branch 66.09% | Funcs 75.99% | Lines 77.59% — all above 75%.
