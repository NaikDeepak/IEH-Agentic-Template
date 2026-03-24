import { initializeApp } from "firebase/app";
import {
    getAuth,
    connectAuthEmulator,
    GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env['VITE_FIREBASE_API_KEY'] as string,
    authDomain: import.meta.env['VITE_FIREBASE_AUTH_DOMAIN'] as string,
    projectId: import.meta.env['VITE_FIREBASE_PROJECT_ID'] as string,
    storageBucket: import.meta.env['VITE_FIREBASE_STORAGE_BUCKET'] as string,
    messagingSenderId: import.meta.env['VITE_FIREBASE_MESSAGING_SENDER_ID'] as string,
    appId: import.meta.env['VITE_FIREBASE_APP_ID'] as string,
    measurementId: import.meta.env['VITE_FIREBASE_MEASUREMENT_ID'] as string
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const authEmulatorHost = import.meta.env['VITE_FIREBASE_AUTH_EMULATOR_HOST'] as string | undefined;
const authEmulatorPort = Number(import.meta.env['VITE_FIREBASE_AUTH_EMULATOR_PORT'] as string | undefined) || 9099;
const firestoreEmulatorHost = import.meta.env['VITE_FIREBASE_FIRESTORE_EMULATOR_HOST'] as string | undefined;
const firestoreEmulatorPort = Number(import.meta.env['VITE_FIREBASE_FIRESTORE_EMULATOR_PORT'] as string | undefined) || 8080;

// Connect to emulators ONLY when explicitly opted in via VITE_USE_FIREBASE_EMULATOR=true.
// Do NOT use import.meta.env.DEV here — that would break local dev against the live DB
// and cause connection errors when emulators aren't running.
if (import.meta.env['VITE_USE_FIREBASE_EMULATOR'] === 'true') {
    connectAuthEmulator(auth, `http://${authEmulatorHost ?? '127.0.0.1'}:${authEmulatorPort}`);
    connectFirestoreEmulator(db, firestoreEmulatorHost ?? '127.0.0.1', firestoreEmulatorPort);
}

export const googleProvider = new GoogleAuthProvider();


export {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    sendEmailVerification
} from "firebase/auth";

// Setting standard prompt for Google account shift as requested in auth.md
googleProvider.setCustomParameters({ prompt: 'select_account' });
