# Environment Separation: Dev / Staging / Prod

**Date:** 2026-03-24

## What

Introduced a three-environment strategy to prevent local development and testing from polluting the production Firebase database.

- `.gitignore` — added `.env.staging`, `.env.production`, `.env.development`, `.env.test` to the ignore list
- `.firebaserc` — added `staging` alias pointing to `india-emp-hub-dev` (new Firebase project to be created in console)
- `package.json` — updated `dev:full:emulator` to use `--import`/`--export-on-exit` for persistent seed data; added `deploy:staging` and `deploy:prod` scripts; added `build:staging`
- `firebase-export/` — new directory for committed emulator seed data
- `docs/TRD.md` — added Section 5 documenting the environment matrix and deployment flow

## Where

- `.gitignore`
- `.firebaserc`
- `package.json`
- `firebase-export/.gitkeep`
- `docs/TRD.md`

## Why

Dev work was hitting the production Firestore database directly, risking data pollution and accidental modification of live user records. The emulator infrastructure already existed but was not the default workflow and had no persistent seed data.
