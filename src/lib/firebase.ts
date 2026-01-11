import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAYpqQm3ZP973y0DFl6Vt2qbtLes-WegQw",
    authDomain: "india-emp-hub.firebaseapp.com",
    projectId: "india-emp-hub",
    storageBucket: "india-emp-hub.firebasestorage.app",
    messagingSenderId: "413194577636",
    appId: "1:413194577636:web:d988312b59d73c01ba6ef1",
    measurementId: "G-YCLH4Y9MP7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Setting standard prompt for Google account shift as requested in auth.md
googleProvider.setCustomParameters({ prompt: 'select_account' });
