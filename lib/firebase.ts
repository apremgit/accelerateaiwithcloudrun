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

let currentApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export async function ensureClientFirebaseConfig(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch('/api/config/auth');
    if (!res.ok) return false;
    const config = await res.json();
    if (config.apiKey && config.apiKey.length > 10 && config.apiKey !== validApiKey) {
      // Re-initialize or update with Secret Manager runtime key
      const dynamicConfig = {
        ...firebaseConfig,
        apiKey: config.apiKey,
      };
      // Delete existing placeholder app or create named primary app
      currentApp = initializeApp(dynamicConfig, 'pai-runtime-client');
      authInstance = getAuth(currentApp);
      dbInstance = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
        ? getFirestore(currentApp, config.firestoreDatabaseId)
        : getFirestore(currentApp);
      return true;
    }
  } catch (e) {
    console.warn('[Firebase] Dynamic config fetch deferred:', e);
  }
  return false;
}

// Automatically trigger on client load
if (typeof window !== 'undefined') {
  ensureClientFirebaseConfig().catch(() => {});
}

// Use the designated Firestore Database ID if present, safe against build prerendering
let dbInstance: any;
try {
  dbInstance = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
    ? getFirestore(currentApp, firebaseConfigJson.firestoreDatabaseId)
    : getFirestore(currentApp);
} catch (e) {
  console.warn('[Firebase] Firestore init deferred:', e);
}
export const db = dbInstance;

let authInstance: any;
try {
  authInstance = getAuth(currentApp);
} catch (e) {
  console.warn('[Firebase] Auth init deferred:', e);
}
export const auth = authInstance;

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async () => {
  // Ensure runtime config from Secret Manager is loaded first
  await ensureClientFirebaseConfig();
  const activeAuth = authInstance || auth;
  if (!activeAuth) {
    return { user: null, error: 'Firebase Auth is not initialized. Please check FIREBASE_API_KEY in Secret Manager.' };
  }
  try {
    const result = await signInWithPopup(activeAuth, googleProvider);
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
