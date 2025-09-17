// src/agent/profile-manager.ts
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export interface Profile {
  username: string;
  handles: string[];
  customPrompt: string;
  facts: string[];
  isActive: boolean;
}

// In-memory cache for profiles to reduce Firestore reads
let profileCache: Map<string, Profile> = new Map();
let lastLoadTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Loads or reloads profiles from the 'profiles' collection in Firestore.
 * It only fetches profiles where 'isActive' is true.
 * @returns {Promise<void>}
 */
async function loadProfiles(): Promise<void> {
  console.log('🔄 Loading profiles from Firestore...');
  try {
    const profilesCollection = collection(db, 'profiles');
    const q = query(profilesCollection, where('isActive', '==', true));
    const querySnapshot = await getDocs(q);

    const newCache = new Map<string, Profile>();
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<Profile, 'id'>;
      const profile: Profile = { ...data, username: doc.id };
      
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
  } catch (error) {
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
export async function getProfileByHandle(handle: string): Promise<Profile | undefined> {
  const now = Date.now();
  if (now - lastLoadTimestamp > CACHE_TTL || profileCache.size === 0) {
    await loadProfiles();
  }

  return profileCache.get(handle.toLowerCase());
}

// Initial load when the module starts
loadProfiles().catch(console.error);
