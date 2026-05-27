import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// These environment variables are automatically injected by AI Studio
const env = (import.meta as any).env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.error("Firebase API Key is missing. The application will not function correctly.");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = env.VITE_FIREBASE_DATABASE_ID ? getFirestore(app, env.VITE_FIREBASE_DATABASE_ID) : getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
