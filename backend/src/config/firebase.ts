import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth as firebaseAuth } from 'firebase-admin/auth';
import { getFirestore as firestore } from 'firebase-admin/firestore';
import { getStorage as storage } from 'firebase-admin/storage';
import dotenv from 'dotenv';
dotenv.config();

let initialized = false;

export function initFirebase() {
  if (initialized) return;
  if (getApps().length) { initialized = true; return; }
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET } = process.env;
  if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    initializeApp({
      credential: cert({
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

export const isFirebaseReady = () => getApps().length > 0;
export const getAuth = () => isFirebaseReady() ? firebaseAuth() : null;
export const getFirestore = () => isFirebaseReady() ? firestore() : null;
export const getStorage = () => isFirebaseReady() ? storage() : null;
