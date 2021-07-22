import { initializeApp } from 'firebase/app';
import { initializeAuth, indexedDBLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


export const app = initializeApp({
  apiKey: process.env.FIREBASE_KEY,
  authDomain: process.env.FIREBASE_AUTH,
  projectId: process.env.FIREBASE_PROJECT,
  storageBucket: process.env.FIREBASE_STORAGE,
  messagingSenderId: process.env.FIREBASE_MSG_ID,
  appId: process.env.FIREBASE_APPID
});

export const firebaseAuth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence]
});

export const firestore = getFirestore(app);