import { NextResponse } from 'next/server';
import firebaseConfigJson from '@/firebase-applet-config.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfigJson.apiKey || '';
  
  return NextResponse.json({
    apiKey,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
    projectId: process.env.FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
    appId: process.env.FIREBASE_APP_ID || firebaseConfigJson.appId,
  });
}
