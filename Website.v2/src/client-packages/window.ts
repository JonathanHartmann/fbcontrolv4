import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';


declare global {
  interface Window {
    database: firebase.database.Database
  }
}

const firebaseConfig = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: process.env.FIREBASE_AUTH,
  projectId: process.env.FIREBASE_PROJECT,
  storageBucket: process.env.FIREBASE_STORAGE,
  messagingSenderId: process.env.FIREBASE_MSG_ID,
  appId: process.env.FIREBASE_APPID
};

firebase.initializeApp(firebaseConfig);

window.database = firebase.database();

export default window;