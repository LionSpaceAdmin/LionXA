
import path from 'path';
import fs from 'fs';

// --- Constants ---
const MEMORY_PATH = path.resolve(__dirname, './memory.json');
const DATA_DIR = path.dirname(MEMORY_PATH);

// --- State ---
let seenTweetIds: Set<string> = new Set();
let hasUnsavedChanges = false;

/**
 * Ensures the data directory exists before trying to read/write files.
 */
function ensureDataDirectoryExists(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Loads the set of seen tweet IDs from the memory file.
 * This is called once when the module is first imported.
 */
function loadMemory(): void {
  ensureDataDirectoryExists();
  if (fs.existsSync(MEMORY_PATH)) {
    try {
      const fileContent = fs.readFileSync(MEMORY_PATH, 'utf-8');
      const ids = JSON.parse(fileContent);
      if (Array.isArray(ids)) {
        seenTweetIds = new Set(ids);
        console.log(`🧠 Loaded ${seenTweetIds.size} tweet IDs from memory.`);
      }
    } catch (error) {
      console.error('Failed to load memory file. Starting with an empty set.', error);
      seenTweetIds = new Set();
    }
  } else {
    console.log('No memory file found. Starting with an empty set.');
  }
}

/**
 * Saves the current set of seen tweet IDs to the memory file.
 * This should be called when the application is shutting down.
 */
function saveMemory(): void {
  if (!hasUnsavedChanges) {
    return; // No need to write if nothing has changed
  }
  console.log('💾 Saving memory to disk...');
  try {
    ensureDataDirectoryExists();
    const data = JSON.stringify(Array.from(seenTweetIds), null, 2);
    fs.writeFileSync(MEMORY_PATH, data);
    hasUnsavedChanges = false; // Reset flag after saving
    console.log(`✅ Saved ${seenTweetIds.size} tweet IDs.`);
  } catch (error) {
    console.error('❌ Failed to save memory file:', error);
  }
}

// --- Public API ---

/**
 * Checks if a tweet ID has been seen before.
 * @param tweetId The ID of the tweet to check.
 * @returns True if the tweet has been seen, false otherwise.
 */
export function isSeen(tweetId: string): boolean {
  return seenTweetIds.has(tweetId);
}

/**
 * Marks a tweet ID as seen. This updates the in-memory set
 * and flags that there are changes to be saved.
 * @param tweetId The ID of the tweet to mark as seen.
 */
export function markSeen(tweetId:string): void {
  if (!seenTweetIds.has(tweetId)) {
    seenTweetIds.add(tweetId);
    hasUnsavedChanges = true;
  }
}

// --- Initialization and Shutdown ---

// Load memory on module initialization
loadMemory();

// Register a shutdown hook to save memory gracefully
export function registerGracefulShutdown() {
    const shutdown = () => {
        saveMemory();
        process.exit(0);
    };
    process.on('exit', saveMemory);
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('uncaughtException', (err) => {
      console.error('An uncaught exception occurred!', err);
      saveMemory();
      process.exit(1);
    });
}
