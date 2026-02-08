# Phase 2 Plan 03: Expiration Warnings Summary

## 1. Overview

**One-Liner:** Implemented automated email notifications to warn users 24 hours before their profile or job posting expires.

**Status:** Complete
**Date:** 2026-02-07

## 2. Execution Details

### Key Accomplishments
- **Nodemailer Integration:** Added `nodemailer` to Cloud Functions for email delivery.
- **Warning Logic:** Extended the daily `reaper` task to query for items expiring in the 24-48h window.
- **Dual Targeting:** Notifications cover both User Profiles (candidates) and Job Postings (recruiters).
- **Graceful Degradation:** Skips email sending if credentials are missing, logging a warning instead of crashing.

### Key Files
- `functions/index.js`: Added email sending logic to `reaper` function.
- `functions/package.json`: Added `nodemailer` dependency.

## 3. Decisions Made

| Decision | Context | Rationale |
|Strings | Strings | Strings |
| **Integrate into Reaper** | Scheduled Tasks | Instead of a separate function, adding to `reaper` keeps all time-based lifecycle logic in one place and minimizes cold starts/billing. |
| **24-48h Window** | Query Logic | Ensures users are warned exactly once (since reaper runs every 24h). If it runs at T-25h, they get warned. If it runs at T-23h, they are missed (edge case accepted for MVP complexity reduction vs tracking "warned" boolean). |
| **Environment Variables** | Configuration | Used `EMAIL_USER` and `EMAIL_PASS` for Gmail SMTP, keeping secrets out of code. |

## 4. Deviations & Blockers

### Deviations
None. Plan executed as written.

### Blockers
None.

## 5. Next Steps

- **Test in Production:** Verify Gmail SMTP limits aren't hit with larger user bases.
- **Switch to Transactional Provider:** For scale, move from Gmail SMTP to SendGrid/Resend/Postmark (future phase).
