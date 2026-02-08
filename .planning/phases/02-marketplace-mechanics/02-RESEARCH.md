# Phase 02: Marketplace Mechanics - Research

**Researched:** 2026-02-07
**Domain:** Background Jobs, Activity Tracking, Email Notifications
**Confidence:** HIGH

## Summary

Phase 2 implements the "Active System" to maintain marketplace freshness. The core mechanic is a 4-day activity timeout that downgrades Users and Jobs from `ACTIVE` to `PASSIVE`.

The standard approach uses **Firebase Cloud Functions (2nd Gen)** for scheduling and **Nodemailer** for notifications.

**Primary recommendation:** Use Firebase V2 `onSchedule` for the expiration logic and client-side throttling to minimize `last_active` writes.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `firebase-functions` | ^5.0+ | Serverless Backend | Native integration, supports V2 `onSchedule`. |
| `firebase-admin` | ^12.0+ | Database Access | Privileged access to Firestore for batch updates. |
| `nodemailer` | ^6.9 | Email Sending | Industry standard for Node.js email transport. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `date-fns` | ^3.0 | Date Manipulation | parsing/formatting dates for comparison. |
| `p-limit` | ^5.0 | Concurrency Control | Limiting parallel promises during batch processing. |

**Installation:**
```bash
cd functions
npm install nodemailer
npm install date-fns
```

## Architecture Patterns

### 1. The "Reaper" Cron Job
A scheduled function runs periodically (e.g., every hour) to find and transition expired entities.

**Pattern:**
1.  **Query:** Find items where `status == 'ACTIVE'` AND `last_active_at < (now - 4 days)`.
2.  **Batch Update:** Update `status` to `PASSIVE` and trigger notification.
3.  **Warning Query:** Find items where `status == 'ACTIVE'` AND `last_active_at < (now - 3 days)` AND `warning_sent == false`.
4.  **Notify:** Send warning email and mark `warning_sent = true`.

**Example (V2 Scheduler):**
```typescript
// Source: Firebase V2 Docs
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

exports.checkExpiration = onSchedule("every 1 hours", async (event) => {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  const cutoff = new Date(now.toMillis() - (4 * 24 * 60 * 60 * 1000)); // 4 days ago

  const snapshot = await db.collection('jobs')
    .where('status', '==', 'ACTIVE')
    .where('last_active_at', '<', admin.firestore.Timestamp.fromDate(cutoff))
    .get();

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { status: 'PASSIVE' });
  });

  await batch.commit();
});
```

### 2. Throttled Activity Tracking
Updating `last_active_at` on every page view is expensive and unnecessary.

**Pattern:** "Debounced Write"
-   **Client-side:** Check `auth.currentUser.last_active_at`.
-   **Logic:** Only send update request if `Date.now() - last_active_at > 1 hour` (or 24 hours).
-   **Implementation:** Can be done in the `useAuth` hook or a global route listener.

### 3. Ranking Drop
"Passive items drop to the bottom."

**Pattern:** Sort Order
-   Add a `sort_order` field or strict sorting rules.
-   **Better Approach:** Use `orderBy` with multiple fields.
    -   `orderBy('status_order', 'asc')` (where ACTIVE=1, PASSIVE=2)
    -   `orderBy('created_at', 'desc')`
-   **Note:** Requires a Composite Index in Firestore.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scheduling | `setInterval` in Node | `onSchedule` | Reliability, scaling, separation of concerns. |
| SMTP Client | Raw TCP/Sockets | `nodemailer` | Complexity of MIME, Auth, TLS is massive. |
| Date Math | `Date.parse()` | `date-fns` | Timezones and leap years are hard to get right manually. |

## Common Pitfalls

### Pitfall 1: The "Write Explosion"
**What goes wrong:** Updating `last_active_at` on *every* navigation event or API call.
**Impact:** Massive Firestore write costs ($$$).
**Prevention:** Throttle updates to once per session or once per 12-24 hours.

### Pitfall 2: Querying the World
**What goes wrong:** Loading *all* jobs to check dates in the cron job.
**Impact:** Memory overflow, slow execution, high read costs.
**Prevention:** Always use `where()` clauses. Ensure Composite Indexes exist for `status` + `last_active_at`.

### Pitfall 3: Function Timeouts
**What goes wrong:** Processing 10,000 expired jobs in one loop takes > 60s.
**Impact:** Function crashes, partial updates.
**Prevention:**
1. Use `limit()` on the query (e.g., process 500 at a time).
2. Since it runs hourly, it will catch up eventually.

## Code Examples

### Sending Email (Nodemailer)
```javascript
// Source: Nodemailer Docs
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

await transporter.sendMail({
  from: '"IEH Support" <support@indiaemphub.com>',
  to: userEmail,
  subject: "Action Required: Your profile is expiring soon",
  text: "Log in to keep your profile active."
});
```

## Open Questions

1.  **Email Provider:** Are we using Gmail (rate limited, good for dev) or a transactional provider (SendGrid/Mailgun)?
    -   *Recommendation:* Start with Gmail for MVP, switch env vars to SendGrid later.
2.  **Mobile App API:** The requirement mentions exposing logic via API.
    -   *Recommendation:* The "Activity Refresh" should be an endpoint (`POST /api/activity/refresh`) that the client calls, rather than hidden inside a different operation.

## Sources

### Primary (HIGH confidence)
-   [Firebase Functions V2 Scheduling](https://firebase.google.com/docs/functions/schedule-functions?gen=2nd)
-   [Nodemailer Documentation](https://nodemailer.com/about/)

### Secondary (MEDIUM confidence)
-   Firestore Pricing (verified via general knowledge: reads/writes are billed).

## Metadata
**Confidence breakdown:**
-   Standard Stack: HIGH (Firebase/Nodemailer is the defacto Node stack).
-   Architecture: HIGH (Cron + Batch update is standard).
-   Pitfalls: HIGH (Cost optimization is well documented).

**Research date:** 2026-02-07
