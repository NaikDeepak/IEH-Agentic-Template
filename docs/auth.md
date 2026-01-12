# Authentication Documentation

## Overview
India Employment Hub uses **Firebase Authentication** for user management. We primarily support **Google Sign-In** to ensure a seamless experience for both candidates and employers.

## Google account management

### Shifting from one Google account to another
If a user needs to shift from one Google account to another (e.g., from a personal account to a professional one, or across different developer accounts):

1.  **Logout Current Session**: Call `signOut(auth)` to clear tokens.
2.  **Clear Local Storage**: Ensure any persisted user data (role, preferences) is cleared.
3.  **Prompt for Account Selection**: Use `setCustomParameters({ prompt: 'select_account' })` on the Google provider to force the account selector.
4.  **Re-authentication**: The user selects the new account and completes the Google OAuth flow.
5.  **Data Migration (Optional)**: If data needs to be moved between accounts, this must be handled as a server-side administrative task or via a specific migration tool that transfers Firestore documents associated with UID A to UID B.

## Implementation Details
- **Provider**: `GoogleAuthProvider`
- **Persistence**: `browserLocalPersistence`
- **RBAC**: User roles (Seeker/Employer) are stored in the `/users/{uid}` collection in Firestore.
