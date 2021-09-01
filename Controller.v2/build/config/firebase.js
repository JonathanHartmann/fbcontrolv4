"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firestore = exports.app = void 0;
var firebase_admin_1 = __importDefault(require("firebase-admin"));
var serviceAccount = require("../../serviceAccountKey.json");
exports.app = firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
    databaseURL: 'https://fbcontrolv4.firebaseio.com'
});
exports.firestore = exports.app.firestore();
