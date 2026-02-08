# Debugging & Testing Patterns

## Vitest & Mocking
- **Partial Mocking Modules**: When mocking a module that has multiple exports (like `firebase/firestore`), if you only mock some functions, the others might be undefined if you don't use `importOriginal`.
  ```typescript
  vi.mock('firebase/firestore', async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      collection: vi.fn(),
      // ...
    };
  });
  ```
- **Mocking Firebase Admin**: `firebase-admin` often requires mocking specific subpaths like `firebase-admin/app` and `firebase-admin/auth` separately if the code imports them directly.
- **Async Middleware in Express**: When testing Express handlers or middleware that are async, ensure mocks return promises (e.g., `mockResolvedValue`) to avoid race conditions or unhandled promise rejections.

## Security
- **Backend Auth Verification**: Always verify Firebase ID tokens on the backend using `admin.auth().verifyIdToken()`. Do not rely on the client simply sending a bearer token.
- **RBAC**: Implement explicit role checks (`requireRole`) for sensitive endpoints, especially those exposing user data (like candidate searches).
