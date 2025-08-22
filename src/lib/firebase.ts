// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "eventide-tracker-98qa8",
  "appId": "1:225106749263:web:95ea393793fc1b616ec73a",
  "storageBucket": "eventide-tracker-98qa8.firebasestorage.app",
  "apiKey": "AIzaSyBA5DfYrE7hTknEC5fnLrkZW0BbgAh4gOk",
  "authDomain": "eventide-tracker-98qa8.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "225106749263"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
