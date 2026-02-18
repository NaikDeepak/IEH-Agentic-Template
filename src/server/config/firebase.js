import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK if not already initialized
if (getApps().length === 0) {
    console.log('Initializing Firebase Admin...');

    const isEmulator =
        !!process.env.FIREBASE_AUTH_EMULATOR_HOST ||
        !!process.env.FIRESTORE_EMULATOR_HOST ||
        process.env.VITE_USE_FIREBASE_EMULATOR === 'true' ||
        process.env.VITE_USE_FIREBASE_EMULATOR === true;

    // Default emulator settings if requested but hosts missing
    if (isEmulator && !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
    }
    if (isEmulator && !process.env.FIRESTORE_EMULATOR_HOST) {
        process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    }

    const projectId =
        process.env.FIREBASE_PROJECT_ID ||
        process.env.VITE_FIREBASE_PROJECT_ID ||
        (isEmulator ? 'india-emp-hub' : undefined);

    if (!projectId) {
        throw new Error('Missing FIREBASE_PROJECT_ID (required outside emulators). Set FIREBASE_PROJECT_ID in environment.');
    }

    initializeApp({ projectId });
    console.log(`Firebase Admin initialized for project: ${projectId}${isEmulator ? ' [EMULATOR]' : ''}`);
}

export const db = getFirestore();


