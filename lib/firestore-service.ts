'use client';

import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  category: 'reflection' | 'brainstorm' | 'journal' | 'summary' | 'action_plan';
  mood?: string;
  tags: string[];
  messages: ChatMessage[];
  summary?: string;
  keyInsights?: string[];
  actionItems?: string[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Utility to strip undefined values recursively to prevent Firestore write crashes
 */
export function sanitizePayload<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizePayload(item)) as any;
  }
  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        sanitized[key] = sanitizePayload(value);
      }
    }
    return sanitized as T;
  }
  return obj;
}

/**
 * Save or update a journal reflection entry for a specific user
 */
export async function saveJournalEntry(userId: string, entry: JournalEntry): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User ID is required for Firestore operations' };
  }
  if (!db) {
    return { success: false, error: 'Firestore is not initialized' };
  }

  try {
    const entryRef = doc(db, 'users', userId, 'entries', entry.id);
    const sanitizedData = sanitizePayload({
      ...entry,
      userId,
      updatedAt: Date.now(),
      serverUpdated: serverTimestamp(),
    });

    await setDoc(entryRef, sanitizedData, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error('Firestore saveJournalEntry Error:', error);
    return { success: false, error: error?.message || 'Failed to save entry to Firestore' };
  }
}

/**
 * Fetch all entries for a specific user
 */
export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  if (!userId || !db) return [];

  try {
    const entriesRef = collection(db, 'users', userId, 'entries');
    const q = query(entriesRef, orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const entries: JournalEntry[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      entries.push({
        id: docSnap.id,
        userId: data.userId || userId,
        title: data.title || 'Untitled Reflection',
        category: data.category || 'reflection',
        mood: data.mood || undefined,
        tags: Array.isArray(data.tags) ? data.tags : [],
        messages: Array.isArray(data.messages) ? data.messages : [],
        summary: data.summary || undefined,
        keyInsights: Array.isArray(data.keyInsights) ? data.keyInsights : undefined,
        actionItems: Array.isArray(data.actionItems) ? data.actionItems : undefined,
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
      });
    });

    return entries;
  } catch (error) {
    console.error('Firestore getJournalEntries Error:', error);
    return [];
  }
}

/**
 * Real-time listener for user's journal entries
 */
export function subscribeToJournalEntries(
  userId: string,
  onUpdate: (entries: JournalEntry[]) => void,
  onError?: (err: Error) => void
) {
  if (!userId || !db) return () => {};

  const entriesRef = collection(db, 'users', userId, 'entries');
  const q = query(entriesRef, orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const entries: JournalEntry[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        entries.push({
          id: docSnap.id,
          userId: data.userId || userId,
          title: data.title || 'Untitled Reflection',
          category: data.category || 'reflection',
          mood: data.mood || undefined,
          tags: Array.isArray(data.tags) ? data.tags : [],
          messages: Array.isArray(data.messages) ? data.messages : [],
          summary: data.summary || undefined,
          keyInsights: Array.isArray(data.keyInsights) ? data.keyInsights : undefined,
          actionItems: Array.isArray(data.actionItems) ? data.actionItems : undefined,
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
          updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
        });
      });
      onUpdate(entries);
    },
    (error) => {
      console.error('Firestore Real-Time Subscription Error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Delete a specific entry
 */
export async function deleteJournalEntry(userId: string, entryId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId || !entryId) {
    return { success: false, error: 'User ID and Entry ID are required' };
  }
  if (!db) {
    return { success: false, error: 'Firestore is not initialized' };
  }

  try {
    const entryRef = doc(db, 'users', userId, 'entries', entryId);
    await deleteDoc(entryRef);
    return { success: true };
  } catch (error: any) {
    console.error('Firestore deleteJournalEntry Error:', error);
    return { success: false, error: error?.message || 'Failed to delete entry from Firestore' };
  }
}
