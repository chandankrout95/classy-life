import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

import { useFirebase, useFirebaseApp, useAuth, useFirestore, useStorage, FirebaseProvider } from './provider';
import { FirebaseClientProvider } from './client-provider';
import { useUser } from './auth/use-user';

// Global variable to track persistence initialization
let persistencePromise: Promise<void> | null = null;

function initializeFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
} {
  const apps = getApps();
  const app = apps.length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  // FIXED: Persistence logic with singleton pattern
  if (typeof window !== 'undefined' && !persistencePromise) {
    persistencePromise = enableIndexedDbPersistence(firestore).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence enabled in one tab only.');
      } else if (err.code === 'unimplemented') {
        console.warn('Browser does not support persistence.');
      }
    });
  }

  return { app, auth, firestore, storage };
}

// Initialize once
const { app, auth, firestore, storage } = initializeFirebase();

export {
  auth,
  firestore,
  storage,
  app,
  initializeFirebase,
  useFirebase,
  useFirebaseApp,
  useAuth,
  useFirestore,
  useStorage,
  useUser,
  FirebaseProvider,
  FirebaseClientProvider
};