// src/config.ts
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const DATA_DIR = path.resolve(process.cwd(), 'data');

/**
 * A centralized configuration object for the entire application.
 * It pulls values from environment variables, providing default fallbacks
 * and type conversions where necessary.
 */
export const config = {
  // Gemini API settings
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  
  // Twitter/X settings
  twitter: {
    listUrl: process.env.TWITTER_LIST_URL || 'https://x.com/i/lists/1950005227715014919',
    // The precise list of usernames to target
    targetUsernames: new Set([
        'FuckIsrEveryHr',
        'vikingwarrior20',
        'Khamenei_m',
        'AdameMedia',
        'jacksonhinklle',
        'Khamenei_fa',
        'IlhanMN',
        'SuppressedNws',
        'AbujomaaGaza',
        'RashidaTlaib',
        'MaxBlumenthal',
        'khamenei_ir'
    ]),
  },

  // Browser automation settings
  browser: {
    // Persistent Chromium user-data-dir to keep session/cookies across runs
    userDataDir: process.env.BROWSER_USER_DATA_DIR || path.join(DATA_DIR, 'chromium_profile'),
    // INTERACTIVE=1 (default) -> headful, INTERACTIVE=0 -> headless
    headless: process.env.INTERACTIVE === '0' || process.env.HEADLESS_BROWSER === 'true',
    // Initial navigation target (list/notifications)
    startUrl: process.env.START_URL || (process.env.TWITTER_LIST_URL || 'https://x.com/i/lists/1950005227715014919')
  },

  // Agent operational parameters
  agent: {
    pollingIntervalMs: 60 * 1000, // 60 seconds
    actionTimeoutMs: 30 * 1000, // 30 seconds
    initialPostLimit: 5, // Start with fewer posts
    initialReplyDelayMs: 3 * 60 * 1000, // 3 minutes
    security: {
      maxRetries: 3,
      cooldownPeriod: 15 * 60 * 1000, // 15 minutes
      ipRotationEnabled: process.env.ENABLE_IP_ROTATION === 'true',
      proxyList: process.env.PROXY_LIST?.split(',') || [],
      backupInterval: 30 * 60 * 1000, // 30 minutes
      backupPath: process.env.BACKUP_PATH || path.join(DATA_DIR, 'backups')
    },
    rateLimit: {
      maxRequestsPerHour: 50,
      maxTweetsPerDay: 100,
      minDelayBetweenReplies: 2 * 60 * 1000 // 2 minutes
    }
  },
  
  // Data paths
  data: {
    dir: DATA_DIR,
    memory: path.join(DATA_DIR, 'memory.json'),
    handledTweets: path.join(DATA_DIR, 'handled_tweets.json'),
    cookies: path.join(DATA_DIR, 'cookies.json'),
  }
};

// Validate that the essential API key is present
if (!config.gemini.apiKey) {
  console.error("❌ FATAL: GEMINI_API_KEY is not defined. Please create a .env file and add your key.");
  process.exit(1);
}
