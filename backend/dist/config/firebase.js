"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorage = exports.getFirestore = exports.getAuth = exports.isFirebaseReady = void 0;
exports.initFirebase = initFirebase;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let initialized = false;
function initFirebase() {
    if (initialized)
        return;
    if ((0, app_1.getApps)().length) {
        initialized = true;
        return;
    }
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET } = process.env;
    if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
        (0, app_1.initializeApp)({
            credential: (0, app_1.cert)({
                projectId: FIREBASE_PROJECT_ID,
                clientEmail: FIREBASE_CLIENT_EMAIL,
                privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
            storageBucket: FIREBASE_STORAGE_BUCKET,
        });
        initialized = true;
        console.log('[firebase] admin initialized');
    }
    else {
        console.log('[firebase] missing service account env — Firestore and authentication unavailable');
    }
}
const isFirebaseReady = () => (0, app_1.getApps)().length > 0;
exports.isFirebaseReady = isFirebaseReady;
const getAuth = () => (0, exports.isFirebaseReady)() ? (0, auth_1.getAuth)() : null;
exports.getAuth = getAuth;
const getFirestore = () => (0, exports.isFirebaseReady)() ? (0, firestore_1.getFirestore)() : null;
exports.getFirestore = getFirestore;
const getStorage = () => (0, exports.isFirebaseReady)() ? (0, storage_1.getStorage)() : null;
exports.getStorage = getStorage;
