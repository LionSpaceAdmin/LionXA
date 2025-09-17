// src/agent/memory.ts
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, query, getDocs, limit } from 'firebase/firestore';

const MEMORY_COLLECTION = 'agent_memory';
const SEEN_TWEETS_DOC_ID = 'seen_tweets';

// In-memory cache to reduce Firestore reads
let seenTweetIds: Set<string> = new Set();
let isLoaded = false;

async function loadMemory(): Promise<void> {
  if (isLoaded) return;
  
  console.log('🧠 Loading memory from Firestore...');
  try {
    const docRef = doc(db, MEMORY_COLLECTION, SEEN_TWEETS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Firestore stores the set as an array
      if (data.ids && Array.isArray(data.ids)) {
        seenTweetIds = new Set(data.ids);
      }
    }
    isLoaded = true;
    console.log(`✅ Loaded ${seenTweetIds.size} tweet IDs from Firestore.`);
  } catch (error) {
    console.error('❌ Failed to load memory from Firestore:', error);
    // In case of error, start with an empty set to avoid breaking the agent
    seenTweetIds = new Set();
  }
}

async function saveMemory(): Promise<void> {
  console.log('💾 Saving memory to Firestore...');
  try {
    const docRef = doc(db, MEMORY_COLLECTION, SEEN_TWEETS_DOC_ID);
    // Convert Set to Array for Firestore compatibility
    await setDoc(docRef, { ids: Array.from(seenTweetIds) });
    console.log(`✅ Saved ${seenTweetIds.size} tweet IDs to Firestore.`);
  } catch (error) {
    console.error('❌ Failed to save memory to Firestore:', error);
  }
}

export async function isSeen(tweetId: string): Promise<boolean> {
  await loadMemory();
  return seenTweetIds.has(tweetId);
}

export async function markSeen(tweetId: string): Promise<void> {
  await loadMemory();
  if (!seenTweetIds.has(tweetId)) {
    seenTweetIds.add(tweetId);
    // Save immediately to ensure persistence, can be optimized later
    await saveMemory(); 
  }
}

export function registerGracefulShutdown() {
    const shutdown = async () => {
        await saveMemory();
        process.exit(0);
    };
    process.on('exit', () => saveMemory());
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('uncaughtException', async (err) => {
      console.error('An uncaught exception occurred!', err);
      await saveMemory();
      process.exit(1);
    });
}

// Initial load
loadMemory().catch(console.error);
