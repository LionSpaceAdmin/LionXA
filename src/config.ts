// src/config.ts
import dotenv from "dotenv";
import path from "path";

// Load environment variables from the project root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const DATA_DIR = path.resolve(process.cwd(), "data");
const DEFAULT_PROFILE_DIR = process.env.PROFILE_DIR
  ? path.resolve(process.cwd(), process.env.PROFILE_DIR)
  : path.resolve(process.cwd(), "src/profiles/agent_profile/Default");

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
    listUrl:
      process.env.TWITTER_LIST_URL ||
      "https://x.com/i/lists/1950005227715014919",
  },

  // Browser automation settings
  browser: {
    // Persistent Chromium user-data-dir to keep session/cookies across runs
    userDataDir: process.env.BROWSER_USER_DATA_DIR || DEFAULT_PROFILE_DIR,
    // INTERACTIVE=1 (default) -> headful, INTERACTIVE=0 -> headless
    headless:
      process.env.INTERACTIVE !== "1" &&
      process.env.HEADLESS_BROWSER !== "false",
    // Prefer a stable, system-installed browser for reliability on macOS
    // Options: 'chrome' | 'chromium' | 'msedge' | 'chrome-beta' | 'chrome-canary'
    channel: "chromium",
    // Optional absolute path to a specific browser executable; if set, overrides channel
    executablePath: undefined,
    // Open DevTools on start (only effective in headful mode)
    devtools: process.env.BROWSER_DEVTOOLS === "true",
    // Slow down operations (ms) for debugging/demo purposes
    slowMo: process.env.BROWSER_SLOWMO ? Number(process.env.BROWSER_SLOWMO) : 0,
    // Expose Chrome DevTools Protocol remote debugging port for external tooling/inspection
    debugPort: process.env.BROWSER_DEBUG_PORT
      ? Number(process.env.BROWSER_DEBUG_PORT)
      : 0,
    // Extra CLI args (comma-separated) to pass to the browser process
    extraArgs: (process.env.BROWSER_ARGS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
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
      ipRotationEnabled: process.env.ENABLE_IP_ROTATION === "true",
      proxyList: process.env.PROXY_LIST?.split(",") || [],
      backupInterval: 30 * 60 * 1000, // 30 minutes
      backupPath: process.env.BACKUP_PATH || path.join(DATA_DIR, "backups"),
    },
    rateLimit: {
      maxRequestsPerHour: 50,
      maxTweetsPerDay: 100,
      minDelayBetweenReplies: 2 * 60 * 1000, // 2 minutes
    },
  },

  // Data paths
  data: {
    dir: DATA_DIR,
    memory: path.join(DATA_DIR, "memory.json"),
    handledTweets: path.join(DATA_DIR, "handled_tweets.json"),
    cookies: path.join(DATA_DIR, "cookies.json"),
  },
};

// Validate that the essential API key is present
// Allow skipping the API key check during build steps (e.g., Cloud Build/Next build)
const isBuildPhase =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.SKIP_GEMINI_CHECK === "1";
if (!config.gemini.apiKey && process.env.DRY_RUN !== "1" && !isBuildPhase) {
  console.error(
    "❌ FATAL: GEMINI_API_KEY is not defined. Set it in .env or run with DRY_RUN=1 for a stubbed local mode.",
  );
  process.exit(1);
}
