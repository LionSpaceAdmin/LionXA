// src/profiles/index.ts
import { Profile } from "./types";

// Export the Profile type for external use
export type { Profile };

// Default profile for testing
const defaultProfile: Profile = {
  username: "test_user",
  customPrompt: "A helpful assistant for testing Steel Browser integration. Focus on testing browser functionality.",
  facts: ["Testing automation", "Browser integration"],
  handles: ["test_user"]
};

// A map to hold all the profile configurations, using the username as the key.
const profiles: Map<string, Profile> = new Map();
profiles.set("test_user", defaultProfile);

// Add the default profile
addProfile(defaultProfile);

// --- Helper Function to add profiles ---
function addProfile(profile: Profile & { handles?: string[] }) {
  profiles.set(profile.username.toLowerCase(), profile);
  if (profile.handles && Array.isArray(profile.handles)) {
    for (const handle of profile.handles) {
      profiles.set(handle.toLowerCase(), profile);
    }
  }
}

/**
 * Retrieves a profile configuration for a given username.
 * This function is case-insensitive.
 * @param username The username to look up.
 * @returns The corresponding profile, or the default profile if not found.
 */
export function getProfile(username: string): Profile | undefined {
  const lowerCaseUsername = username.toLowerCase();
  return profiles.get(lowerCaseUsername) || defaultProfile;
}

/**
 * Export a function to get all profiles
 */
export function getAllProfiles(): Profile[] {
  return Array.from(profiles.values());
}

/**
 * Export the default profile
 */
export function getDefaultProfile(): Profile | undefined {
  return defaultProfile;
}