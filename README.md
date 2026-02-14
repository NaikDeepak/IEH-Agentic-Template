## Environment Configuration

### Security Note
**Client-side AI keys are strictly forbidden**. All AI features must use the secure server-side proxy in Cloud Functions.

- **Frontend Variables**: Required only for Firebase configuration (see `.env.example`).
- **Secret Management**: `GEMINI_API_KEY` must be set in Firebase Secrets or Cloud Function environment variables (never prefixed with `VITE_`).

## Growth & Viral Engine (Phase 06)

The platform includes a built-in referral and reward system designed for high-quality, verified growth.

### Production Ready Features
- **Atomic Points Ledger**: Point updates (earning/spending) use Firestore Transactions for guaranteed integrity.
- **Referral Engine**: Unique code generation, registration linking, and automatic reward triggers.
- **Secure Onboarding**: Server-side endpoint for role assignment and custom claims.

### Production Readiness Checklist (MVP Simulation)
Currently, certain trust signals are in **Simulation Mode** for the MVP prototype. To move to production:

1.  **Phone Verification**: 
    - Switch `isSimulated` to `false` in `PhoneVerification.tsx`.
    - Ensure Firebase project is on the "Blaze" plan for SMS quotas.
    - Configure authorized domains in Firebase Console.
2.  **LinkedIn Verification**:
    - Replace the URL-input simulation with real LinkedIn OAuth.
    - Set up a LinkedIn Developer App (requires a Company Page).
    - Implement the backend token exchange in the Express server.
3.  **Redemption Fulfillment**:
    - The `LedgerService` correctly handles point deductions.
    - Integrate a delivery mechanism (e.g., Firebase Functions + SendGrid) to fulfill rewards when a `redemption` ledger entry is created.

## Architecture
See [architecture.md](file:///Users/deepaknaik/Downloads/1. AI Live/IEH/architecture.md) for details on the secure AI proxy and platform design.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
