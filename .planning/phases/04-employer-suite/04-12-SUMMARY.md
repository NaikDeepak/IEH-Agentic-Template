# Phase 04 Plan 12: Firestore Permissions Summary

## Summary
- Updated Firestore security rules for the `applications` collection to fix permission errors in the ATS pipeline.
- Enabled seekers to submit applications with mandatory fields: `employer_id`, `answers`, `match_score`, `applied_at`, and `updated_at`.
- Granted employers permission to update application statuses (`status` and `updated_at`) for jobs they own.
- Enforced data integrity by restricting updates to only specific fields and ensuring immutable candidate/job links.

## Tech Tracking
- **subsystem:** Infrastructure / Security
- **tech-stack.patterns:** Firestore Security Rules (Attribute-Based Access Control)

## File Tracking
- **key-files.modified:**
  - `firestore.rules`: Updated application collection permissions.

## Deviations from Plan
None - plan executed exactly as written.

## Decisions Made
| Plan | Decision | Rationale |
|------|----------|-----------|
| 04-12 | Cross-Collection Auth Check | Verified employer ownership via `get()` call to the linked job document to ensure only the correct employer can update status. |

## Next Phase Readiness
- **provides:** Secure ATS pipeline transitions.
- **affects:** Seeker application flow (Phase 5).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
