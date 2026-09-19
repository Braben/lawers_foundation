import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

let initialized = false;

export function initFirebase() {
  if (initialized) return;
  if (admin.apps.length) { initialized = true; return; }
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET } = process.env;
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      storageBucket: FIREBASE_STORAGE_BUCKET,
    });
    initialized = true;
    console.log('[firebase] admin initialized');
  } else {
    console.log('[firebase] missing service account env — Firestore and authentication unavailable');
  }
}

export const isFirebaseReady = () => admin.apps.length > 0;
export const getAuth = () => isFirebaseReady() ? admin.auth() : null;
export const getFirestore = () => isFirebaseReady() ? admin.firestore() : null;
export const getStorage = () => isFirebaseReady() ? admin.storage() : null;
