// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDgoX5bD9EOMxRwTe1lN1yRIg9lBiNR7So",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "swes-baaa7.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "swes-baaa7",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "swes-baaa7.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "389325460051",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:389325460051:web:fa649ee1ff2dbf12466ca6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7L4PY663HL"
};

const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length) {
  console.error(
    `Firebase config missing keys: ${missing.join(", ")}. ` +
      "A valid Firebase API key and config values are required to start auth."
  );
}


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error(
      "Persistence error:",
      error
    );
  });

export const db = getFirestore(app);
