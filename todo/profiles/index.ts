// src/profiles/index.ts
import AyatollahKhamenei from './AyatollahKhamenei';
import IlhanMN from './IlhanMN';
import JacksonHinklle from './JacksonHinklle';
import MaxBlumenthal from './MaxBlumenthal';
import RashidaTlaib from './RashidaTlaib';
import SuppressedNws from './SuppressedNws';
import { FuckIsrEveryHr } from './FuckIsrEveryHr';
import { Vikingwarrior20 } from './Vikingwarrior20';
import { AdameMedia } from './AdameMedia';
import { AbujomaaGaza } from './AbujomaaGaza';

export interface Profile {
    username: string;
    customPrompt: string;
    facts?: string[];
}

// A map to hold all the profile configurations, using the username as the key.
const profiles: Map<string, Profile> = new Map();

// Add all individual profiles to the map
addProfile(AyatollahKhamenei);
addProfile(IlhanMN);
addProfile(JacksonHinklle);
addProfile(MaxBlumenthal);
addProfile(RashidaTlaib);
addProfile(SuppressedNws);
addProfile(FuckIsrEveryHr);
addProfile(Vikingwarrior20);
addProfile(AdameMedia);
addProfile(AbujomaaGaza);


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
 * This function is case-insensitive. It also handles mapping multiple
 * Khamenei accounts to a single profile.
 * @param username The username to look up.
 * @returns The corresponding profile, or undefined if not found.
 */
export function getProfile(username: string): Profile | undefined {
    const lowerCaseUsername = username.toLowerCase();
    return profiles.get(lowerCaseUsername);
}
