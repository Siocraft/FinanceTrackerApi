import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let firebaseAdmin: any = null;

export function initializeFirebase() {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  // Initialize Firebase Admin SDK only once
  if (getApps().length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    firebaseAdmin = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } else {
    firebaseAdmin = getApps()[0];
  }

  return firebaseAdmin;
}

export function getFirebaseAuth() {
  if (!firebaseAdmin) {
    initializeFirebase();
  }
  return getAuth(firebaseAdmin);
}