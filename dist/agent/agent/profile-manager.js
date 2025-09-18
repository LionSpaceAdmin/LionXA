"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfileByHandle = getProfileByHandle;
// src/agent/profile-manager.ts
const firebase_1 = require("@/lib/firebase");
const firestore_1 = require("firebase/firestore");
// In-memory cache for profiles to reduce Firestore reads
let profileCache = new Map();
let lastLoadTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
/**
 * Loads or reloads profiles from the 'profiles' collection in Firestore.
 * It only fetches profiles where 'isActive' is true.
 * @returns {Promise<void>}
 */
async function loadProfiles() {
    console.log('🔄 Loading profiles from Firestore...');
    try {
        const profilesCollection = (0, firestore_1.collection)(firebase_1.db, 'profiles');
        const q = (0, firestore_1.query)(profilesCollection, (0, firestore_1.where)('isActive', '==', true));
        const querySnapshot = await (0, firestore_1.getDocs)(q);
        const newCache = new Map();
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const profile = { ...data, username: doc.id };
            // Map all handles to the same profile object
            if (profile.handles && Array.isArray(profile.handles)) {
                for (const handle of profile.handles) {
                    newCache.set(handle.toLowerCase(), profile);
                }
            }
        });
        profileCache = newCache;
        lastLoadTimestamp = Date.now();
        console.log(`✅ Loaded ${profileCache.size} active profile handles from Firestore.`);
    }
    catch (error) {
        console.error('❌ Failed to load profiles from Firestore:', error);
        // In case of an error, we keep the old cache to maintain some functionality
    }
}
/**
 * Retrieves a profile by a Twitter handle.
 * It uses a time-based cache to avoid frequent database reads.
 * @param {string} handle - The Twitter handle (without '@').
 * @returns {Promise<Profile | undefined>} The profile if found, otherwise undefined.
 */
async function getProfileByHandle(handle) {
    const now = Date.now();
    if (now - lastLoadTimestamp > CACHE_TTL || profileCache.size === 0) {
        await loadProfiles();
    }
    return profileCache.get(handle.toLowerCase());
}
// Initial load when the module starts
loadProfiles().catch(console.error);
