import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK if not already initialized
if (getApps().length === 0) {
    console.log('Initializing Firebase Admin...');
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'india-emp-hub';

    if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        console.log('Firebase Admin: Using Auth Emulator:', process.env.FIREBASE_AUTH_EMULATOR_HOST);
    }
    if (process.env.FIRESTORE_EMULATOR_HOST) {
        console.log('Firebase Admin: Using Firestore Emulator:', process.env.FIRESTORE_EMULATOR_HOST);
    }

    // For emulator usage, we don't need real credentials, but we DO need the project ID

    // Fallback: If VITE_USE_FIREBASE_EMULATOR is set (common in frontend dev), but specific emulator hosts are missing, default them.
    if (!process.env.FIREBASE_AUTH_EMULATOR_HOST && (process.env.VITE_USE_FIREBASE_EMULATOR === 'true' || process.env.VITE_USE_FIREBASE_EMULATOR === true)) {
        console.warn('Firebase Admin: VITE_USE_FIREBASE_EMULATOR detected but FIREBASE_AUTH_EMULATOR_HOST not set. Defaulting to 127.0.0.1:9099');
        process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
    }
    if (!process.env.FIRESTORE_EMULATOR_HOST && (process.env.VITE_USE_FIREBASE_EMULATOR === 'true' || process.env.VITE_USE_FIREBASE_EMULATOR === true)) {
        console.warn('Firebase Admin: VITE_USE_FIREBASE_EMULATOR detected but FIRESTORE_EMULATOR_HOST not set. Defaulting to 127.0.0.1:8080');
        process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    }

    initializeApp({
        projectId: projectId
    });
    console.log(`Firebase Admin initialized for project: ${projectId}`);
}

export const db = getFirestore();


