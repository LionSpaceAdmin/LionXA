// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "studio-1197401098-1d924",
  "appId": "1:611758111537:web:5cc80a0c0d345e7d7bce10",
  "storageBucket": "studio-1197401098-1d924.firebasestorage.app",
  "apiKey": "AIzaSyDO2I3sCBqXX9o_tiowOQ-7QbpUjfGzBUE",
  "authDomain": "studio-1197401098-1d924.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "611758111537"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
