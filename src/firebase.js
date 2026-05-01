import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const apiKey     = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId  = import.meta.env.VITE_FIREBASE_PROJECT_ID;

export const firebaseConfigured = !!(apiKey && projectId);

export let db = null;

if (firebaseConfigured) {
  const app = initializeApp({
    apiKey,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  });
  db = getFirestore(app);
}
