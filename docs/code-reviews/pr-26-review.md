# PR #26 — Consolidated Review Issues

**PR:** https://github.com/NaikDeepak/IEH-Agentic-Template/pull/26
**Title:** Pr 25 (environment separation + profile/settings pages + emulator fixes)
**Reviewers:** Claude Code · Qodo · Copilot
**Date:** 2026-03-28

---

## Severity Key
- `CRITICAL` — blocks deploy or causes data loss
- `BUG` — incorrect behaviour in production
- `IMPROVEMENT` — correctness/robustness concern, not immediately dangerous
- `MINOR` — style, consistency, or low-risk issue

---

## Issue List

### ISSUE-01 — `deleteAccount` does not clean up Firestore data `BUG`
**Raised by:** Claude, Qodo, Copilot (consensus)
**File:** `src/context/AuthProvider.tsx:531`, `src/pages/SettingsPage.tsx:232-235`

`deleteAccount()` only calls `deleteUser(auth.currentUser)`. The `users/{uid}` Firestore document and all subcollections (applications, profile, referrals) are left behind. Firestore rules do not grant client-side `delete` on the users collection, so the client cannot clean up after itself even if we tried.

The SettingsPage UI copy explicitly promises: _"All your data — profile, applications, and referrals — will be deleted"_ — which is false today.

**Required fix (two-part):**
1. Add a backend endpoint `POST /api/user/delete` (or an Auth `onDelete` Cloud Function trigger) that uses the Admin SDK to delete `users/{uid}` and related subcollections.
2. Either wire `deleteAccount()` to call that endpoint first, or update the SettingsPage copy to accurately describe what is actually deleted until the backend flow is implemented.

---

### ISSUE-02 — `deleteAccount` error propagation: raw Firebase error shown to user `BUG`
**Raised by:** Qodo
**File:** `src/context/AuthProvider.tsx:538-544`, `src/pages/SettingsPage.tsx:74`

`deleteAccount` sets a friendly error via `setError(...)` for `auth/requires-recent-login` but then rethrows the original Firebase error. `SettingsPage` catches the throw and displays `err.message`, which is the raw Firebase message — not the friendly string.

**Fix:** In `SettingsPage.handleDelete`, read from `AuthContext.error` (already set by `deleteAccount`) rather than catching `err.message`:
```ts
} catch {
    // error already set in AuthContext — let the UI read it from there
    setDeletePhase('idle');
}
```

---

### ISSUE-03 — `functions/package.json` deploy script scope accidentally widened `CRITICAL`
**Raised by:** Claude, Qodo, Copilot (consensus)
**File:** `functions/package.json`

```diff
-"deploy": "firebase deploy --only functions"
+"deploy": "cd .. && npm run deploy:prod"
```

Running `npm run deploy` from the `functions/` directory now triggers a full production deploy (hosting + firestore + functions), not a functions-only deploy. Any developer or CI pipeline scoped to functions will silently promote all environments.

**Fix options (Qodo suggestion):**
```json
"deploy:prod": "cd .. && npm run deploy:prod",
"deploy:staging": "cd .. && npm run deploy:staging"
```
Or remove the `deploy` script entirely — functions deploys should always go through root scripts.

---

### ISSUE-04 — `validate-dist.js` assumes `.firebaserc` keys exist without validation `IMPROVEMENT`
**Raised by:** Qodo
**File:** `scripts/validate-dist.js:288-301`

`firebaseRc.projects.staging` and `firebaseRc.projects.default` are read without checking if they exist. If `.firebaserc` is missing or a key is absent, `expectedProjectId` is `undefined` and every build silently passes the validation (since no file will contain `"undefined"`).

**Fix:** Add explicit checks:
```js
if (!expectedProjectId) {
    console.error(`❌  .firebaserc missing projects.${target} — cannot validate`);
    process.exit(1);
}
```

---

### ISSUE-05 — `ProfileRedirect` redirects authenticated users with missing role to `/login` `BUG`
**Raised by:** Copilot
**File:** `src/App.tsx:388-395`

```ts
return <Navigate to="/login" replace />;  // current fallback
```

`/profile` is already inside `<ProtectedRoute>`, so any user reaching `ProfileRedirect` is authenticated. A user who is authenticated but has no role yet (mid-onboarding, or role not yet loaded) gets bounced to `/login`, creating a confusing redirect loop. Compare with `DashboardRedirect` which returns `null` to allow the `RoleSelection` overlay to handle this state.

**Fix:**
```ts
return null; // let RoleSelection overlay handle role-missing state
```

---

### ISSUE-06 — `updateDisplayName` uses `updateDoc` — fails if user document is missing `IMPROVEMENT`
**Raised by:** Qodo, Copilot
**File:** `src/context/AuthProvider.tsx:521`

`updateDoc` throws if the document doesn't exist (e.g. legacy users or inconsistent DB state). `setDoc` with `merge: true` is idempotent and handles both create and update.

**Fix:**
```ts
await setDoc(doc(db, 'users', user.uid), { displayName: name }, { merge: true });
```

---

### ISSUE-07 — `nameValue` can be stale if `user.displayName` loads after mount `IMPROVEMENT`
**Raised by:** Qodo
**File:** `src/pages/SettingsPage.tsx:28`

```ts
const [nameValue, setNameValue] = useState(user?.displayName ?? '');
```

If `user` is `null` on first render (auth still loading) and resolves later, `nameValue` stays empty. The input will show blank even after auth loads.

**Fix:** Sync `nameValue` from `user.displayName` when not actively editing:
```ts
useEffect(() => {
    if (!editingName) setNameValue(user?.displayName ?? '');
}, [user?.displayName, editingName]);
```

---

### ISSUE-08 — `JobsPage.tsx` `useEffect` dependency regression `IMPROVEMENT`
**Raised by:** Claude, Copilot (consensus)
**File:** `src/pages/JobsPage.tsx:87`

```diff
-}, [authLoading, user?.uid]);
+}, [authLoading, user]);
```

The Firebase `User` object reference changes on every token refresh and profile update, causing unnecessary job re-fetches. `user?.uid` is the stable dependency — it only changes when the actual signed-in user changes.

**Fix:** Revert to `[authLoading, user?.uid]`.

---

### ISSUE-09 — `json` unused devDependency added `MINOR`
**Raised by:** Copilot
**File:** `package.json`

`"json": "^11.0.0"` was added to `devDependencies` but is not referenced anywhere in scripts, source, or tooling. Adds unnecessary supply-chain surface area.

**Fix:** Remove it.

---

### ISSUE-10 — No unit tests for `SettingsPage` `MINOR`
**Raised by:** Claude, Qodo, Copilot (consensus)
**File:** `src/pages/__tests__/` (missing)

The project requires >80% coverage. `SettingsPage` has non-trivial flows (name edit, password reset, two-step delete confirmation, error states) with zero test coverage.

**Required:** Add `src/pages/__tests__/SettingsPage.test.tsx` covering:
- Renders account info from auth context
- Edit name: success path, cancel, empty input handling
- Password reset: sent state, error state
- Delete: confirm phase, success (mock navigate), error (e.g. requires-recent-login)

---

## Summary Table

| # | Severity | File | Raised By |
|---|----------|------|-----------|
| ISSUE-01 | `BUG` | `AuthProvider.tsx`, `SettingsPage.tsx` | Claude + Qodo + Copilot |
| ISSUE-02 | `BUG` | `AuthProvider.tsx`, `SettingsPage.tsx` | Qodo |
| ISSUE-03 | `CRITICAL` | `functions/package.json` | Claude + Qodo + Copilot |
| ISSUE-04 | `IMPROVEMENT` | `scripts/validate-dist.js` | Qodo |
| ISSUE-05 | `BUG` | `src/App.tsx` | Copilot |
| ISSUE-06 | `IMPROVEMENT` | `AuthProvider.tsx` | Qodo + Copilot |
| ISSUE-07 | `IMPROVEMENT` | `SettingsPage.tsx` | Qodo |
| ISSUE-08 | `IMPROVEMENT` | `JobsPage.tsx` | Claude + Copilot |
| ISSUE-09 | `MINOR` | `package.json` | Copilot |
| ISSUE-10 | `MINOR` | `src/pages/__tests__/` | Claude + Qodo + Copilot |

**Verdict: Request Changes** — ISSUE-01, ISSUE-02, ISSUE-03, ISSUE-05 must be resolved before merge.
