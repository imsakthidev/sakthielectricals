import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// PASTE YOUR FIREBASE CONFIG HERE:
const firebaseConfig = {
  apiKey: "AIzaSyCPam0NaBtOhyI2KyZwE6e9Yv33CK99SNM",
  authDomain: "sakthielectricals-ceff7.firebaseapp.com",
  databaseURL: "https://sakthielectricals-ceff7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sakthielectricals-ceff7",
  storageBucket: "sakthielectricals-ceff7.firebasestorage.app",
  messagingSenderId: "142607909505",
  appId: "1:142607909505:web:1fef9e595563478029c380",
  measurementId: "G-RJHES1RV9V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);