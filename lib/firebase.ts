'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigJson from '../firebase-applet-config.json';

const validApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (firebaseConfigJson.apiKey && firebaseConfigJson.apiKey.length > 5 ? firebaseConfigJson.apiKey : 'AIzaSyDUMMY_KEY_FOR_STATIC_BUILD_PRERENDER');

const firebaseConfig = {
  apiKey: validApiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain || 'learning-gcp-prem.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId || 'learning-gcp-prem',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket || 'learning-gcp-prem.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId || '811322756882',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || firebaseConfigJson.appId || '1:811322756882:web:f13a18fe6c0e2a3703edcb',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use the designated Firestore Database ID if present, safe against build prerendering
let dbInstance: any;
try {
  dbInstance = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
    : getFirestore(app);
} catch (e) {
  console.warn('[Firebase] Firestore init deferred:', e);
}
export const db = dbInstance;

let authInstance: any;
try {
  authInstance = getAuth(app);
} catch (e) {
  console.warn('[Firebase] Auth init deferred:', e);
}
export const auth = authInstance;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async () => {
  if (!auth) {
    return { user: null, error: 'Firebase Auth is not initialized. Please check NEXT_PUBLIC_FIREBASE_API_KEY.' };
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('Firebase Auth Sign-In Error:', error);
    return { user: null, error: error?.message || 'Failed to sign in with Google' };
  }
};

export const signOutUser = async () => {
  if (!auth) {
    return { error: null };
  }
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    console.error('Firebase Sign-Out Error:', error);
    return { error: error?.message || 'Failed to sign out' };
  }
};

export { onAuthStateChanged, type User };
