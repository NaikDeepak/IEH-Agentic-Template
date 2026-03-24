# 2026-03-23 — Sprint 4: Separate Auth Entry Points (M-1)

## What
- New `AuthEntry` role-picker page at `/login` and `/register`
- Dedicated routes: `/login/seeker`, `/login/employer`, `/register/seeker`, `/register/employer`
- Login and Register components accept an optional `role` prop that changes heading copy and CTAs to be persona-specific

## Where
- `src/pages/AuthEntry.tsx` (new)
- `src/components/Login.tsx` — added `role?: 'seeker' | 'employer'` prop
- `src/pages/Register.tsx` — added `role?: 'seeker' | 'employer'` prop
- `src/App.tsx` — new routes, AuthEntry lazy import

## Why
Newcomers on a single `/login` page had no context for which path to take. Tailored copy and role-specific CTAs reduce confusion and improve conversion (M-1 from feature gap analysis).
