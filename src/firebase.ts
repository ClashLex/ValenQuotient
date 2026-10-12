import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-auth-domain',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-storage-bucket',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'demo-sender-id',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'demo-app-id',
};

/**
 * True when Firebase is running on placeholder credentials. The app still
 * renders (calculators are purely local) but every auth/Firestore call will
 * fail, so warn loudly rather than letting it look like a backend bug.
 */
const isDemoConfig = !import.meta.env.VITE_FIREBASE_API_KEY;

if (isDemoConfig && import.meta.env.DEV) {
  console.warn(
    '[ValenQuotient] Firebase is not configured — using placeholder credentials.\n' +
      'Sign-in and cloud sync will fail. Copy .env.example to .env and fill in your\n' +
      'Firebase web app credentials to enable them.'
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: 'select_account' });