import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDAdOoSV_tmdjqKrXU4bSAt8NR2y4-et1E",
    authDomain: "society-62143.firebaseapp.com",
    projectId: "society-62143",
    storageBucket: "society-62143.firebasestorage.app",
    messagingSenderId: "57332876077",
    appId: "1:57332876077:web:29ddecdd4c82fd7ae2c9a4",
    measurementId: "G-N94Y9WK1GK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
