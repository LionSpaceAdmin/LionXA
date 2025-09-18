"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSeen = isSeen;
exports.markSeen = markSeen;
exports.registerGracefulShutdown = registerGracefulShutdown;
// src/agent/memory.ts
const firebase_1 = require("@/lib/firebase");
const firestore_1 = require("firebase/firestore");
const MEMORY_COLLECTION = 'agent_memory';
const SEEN_TWEETS_DOC_ID = 'seen_tweets';
// In-memory cache to reduce Firestore reads
let seenTweetIds = new Set();
let isLoaded = false;
async function loadMemory() {
    if (isLoaded)
        return;
    console.log('🧠 Loading memory from Firestore...');
    try {
        const docRef = (0, firestore_1.doc)(firebase_1.db, MEMORY_COLLECTION, SEEN_TWEETS_DOC_ID);
        const docSnap = await (0, firestore_1.getDoc)(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Firestore stores the set as an array
            if (data.ids && Array.isArray(data.ids)) {
                seenTweetIds = new Set(data.ids);
            }
        }
        isLoaded = true;
        console.log(`✅ Loaded ${seenTweetIds.size} tweet IDs from Firestore.`);
    }
    catch (error) {
        console.error('❌ Failed to load memory from Firestore:', error);
        // In case of error, start with an empty set to avoid breaking the agent
        seenTweetIds = new Set();
    }
}
async function saveMemory() {
    console.log('💾 Saving memory to Firestore...');
    try {
        const docRef = (0, firestore_1.doc)(firebase_1.db, MEMORY_COLLECTION, SEEN_TWEETS_DOC_ID);
        // Convert Set to Array for Firestore compatibility
        await (0, firestore_1.setDoc)(docRef, { ids: Array.from(seenTweetIds) });
        console.log(`✅ Saved ${seenTweetIds.size} tweet IDs to Firestore.`);
    }
    catch (error) {
        console.error('❌ Failed to save memory to Firestore:', error);
    }
}
async function isSeen(tweetId) {
    await loadMemory();
    return seenTweetIds.has(tweetId);
}
async function markSeen(tweetId) {
    await loadMemory();
    if (!seenTweetIds.has(tweetId)) {
        seenTweetIds.add(tweetId);
        // Save immediately to ensure persistence, can be optimized later
        await saveMemory();
    }
}
function registerGracefulShutdown() {
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
