import admin from 'firebase-admin';

var serviceAccount = require("../../serviceAccountKey.json");


export const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://fbcontrolv4.firebaseio.com'
});

export const firestore = app.firestore();
