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

// Connect to emulators if enabled in environment
if (import.meta.env.DEV || import.meta.env['VITE_USE_FIREBASE_EMULATOR'] === 'true') {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

export const googleProvider = new GoogleAuthProvider();


export {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from "firebase/auth";

// Setting standard prompt for Google account shift as requested in auth.md
googleProvider.setCustomParameters({ prompt: 'select_account' });
