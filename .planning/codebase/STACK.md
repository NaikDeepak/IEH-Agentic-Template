# Technology Stack

**Analysis Date:** 2026-01-16

## Languages

**Primary:**
- TypeScript ~5.9 - Used for frontend development in `src/` and type checking.

**Secondary:**
- JavaScript (ES Modules) - Used for backend logic in `index.js` and Firebase Functions in `functions/`.

## Runtime

**Environment:**
- Node.js 22 - Specified in `functions/package.json`.

**Package Manager:**
- npm - Standard manager for the project.
- Lockfile: `package-lock.json` present in `functions/`.

## Frameworks

**Core:**
- React 19.2.0 - Frontend UI library.
- Express 4.22.1 - Backend web framework used in `index.js` and `functions/`.

**Testing:**
- Vitest 4.0.16 - Unit and component testing.
- Playwright 1.57.0 - E2E testing.
- Testing Library 16.3.1 - React component testing.

**Build/Dev:**
- Vite 6.0.0 - Build tool and dev server.
- Tailwind CSS 4.0.0 - Utility-first CSS framework with Vite plugin `@tailwindcss/vite`.

## Key Dependencies

**Critical:**
- `firebase` 12.7.0 - Client-side Firebase SDK.
- `firebase-admin` 13.6.0 - Server-side Firebase SDK used in `index.js` and `functions/`.
- `@google/genai` 1.35.0 - Google Gemini AI SDK for content generation and embeddings.

**Infrastructure:**
- `@sentry/node` & `@sentry/react` 10.32.1 - Error tracking and performance monitoring.
- `framer-motion` 12.25.0 - Animation library for React.
- `lucide-react` 0.562.0 - Icon library.

## Configuration

**Environment:**
- `.env` and `.env.example` - Vite-prefixed variables for frontend and server-side keys.
- `dotenv` used for loading environment variables.

**Build:**
- `tsconfig.json` - TypeScript configuration.
- `firebase.json` - Firebase deployment and emulator configuration.
- `firestore.rules` & `storage.rules` - Security rules for Firebase services.

## Platform Requirements

**Development:**
- Node.js environment with npm.
- Firebase CLI for deployments and emulators.

**Production:**
- Firebase Hosting (Frontend).
- Cloud Run or Firebase Functions (Backend API).

---

*Stack analysis: 2026-01-16*
