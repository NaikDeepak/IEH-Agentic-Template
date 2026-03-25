# 2026-03-25 — Profile & Settings pages

## What
- Added `/profile` route: smart redirect to role-specific profile (`/seeker/profile` for seekers, `/employer/company` for employers, `/admin` for admin)
- Added `/settings` route: new `SettingsPage` with account info, display name editing, password reset, and account deletion
- Added `updateDisplayName` and `deleteAccount` methods to `AuthContext` / `AuthProvider`

## Where
- `src/pages/SettingsPage.tsx` — new file
- `src/context/AuthContext.ts` — interface extended
- `src/context/AuthProvider.tsx` — two new methods
- `src/App.tsx` — two new routes

## Why
The header dropdown (Login navbar variant) already links to `/profile` and `/settings` (S1-AUTH-04 completed). These pages did not exist yet (S5-ACC-01). Users clicking those links hit a blank/broken route.
