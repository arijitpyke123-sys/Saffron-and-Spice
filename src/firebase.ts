import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD6ibKUkIaFtXuV0vqFMAkYDxmQQNKjJ84",
    authDomain: "saffron-and-spice.firebaseapp.com",
    databaseURL: "https://saffron-and-spice-default-rtdb.firebaseio.com",
    projectId: "saffron-and-spice",
    storageBucket: "saffron-and-spice.firebasestorage.app",
    messagingSenderId: "786256662330",
    appId: "1:786256662330:web:3cf20eca086073043d4a03",
    measurementId: "G-GRFR9S6WZ0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, db };
