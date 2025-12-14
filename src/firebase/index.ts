
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

import { useFirebase, useFirebaseApp, useAuth, useFirestore, useStorage, FirebaseProvider } from './provider';
import { FirebaseClientProvider } from './client-provider';
import { useUser } from './auth/use-user';


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

  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(firestore).catch((err) => {
      if (err.code == 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code == 'unimplemented') {
        console.log('The current browser does not support all of the features required to enable persistence.');
      }
    });
  }

  return { app, auth, firestore, storage };
}

export {
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
