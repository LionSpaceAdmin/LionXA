// src/watchList.ts
import { Page, Locator } from "playwright";
import { ensureSession, getSingleton } from "./browser";
import { isSeen, markSeen } from "./memory";
import { askGPT } from "./gemini";
import { getProfile, type Profile } from "./profiles/index";
import { config } from "./config";
import { startBackupScheduler } from "./backup";
import {
  dashboard,
  logTweetProcessed,
  logReplyPosted,
  logGeminiCall,
  logError,
  sendScreencap,
  control,
  logPageConsole,
  logException,
  logAgentLog,
} from "./dashboard";

// --- Constants from Central Config ---
const LIST_URL = config.twitter.listUrl;
const POLLING_INTERVAL_MS = config.agent.pollingIntervalMs;
const INITIAL_REPLY_DELAY_MS = config.agent.initialReplyDelayMs;
const INITIAL_POST_LIMIT = config.agent.initialPostLimit;

// Keywords to check for relevance (Israel/Palestine context)
const RELEVANCE_KEYWORDS = [
  "israel",
  "palestine",
  "gaza",
  "hamas",
  "idf",
  "zionism",
  "zionist",
  "jerusalem",
  "west bank",
  "middle east",
  "conflict",
  "occupation",
  "palestinian",
  "israeli",
  "hezbollah",
  "iran",
  "lebanon",
  "syria",
  "settlers",
  "apartheid",
  "genocide",
  "war crimes",
  "human rights",
  "ceasefire",
  "hostages",
  "rockets",
  "intifada",
  "dome",
  "iron dome",
];

// --- Types ---
interface Tweet {
  id: string;
  text: string;
  author: string;
  username: string;
  fullText: string;
  createdTime: string;
  isRepost: boolean;
  images: string[];
  element: Locator;
}

interface ProfileWithFacts extends Profile {
  facts?: string[];
}

// --- Helper Functions ---

// NOTE: Relevance filter kept for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _isTweetRelevant(text: string): boolean {
  const lowerText = text.toLowerCase();
  return RELEVANCE_KEYWORDS.some((keyword) => lowerText.includes(keyword));
}

/**
 * Scrapes all tweets from the list page (no filtering by target users).
 * Includes validation and cross-checking of tweets.
 */
async function scrapeTweetsFromList(page: Page): Promise<Tweet[]> {
  const tweets: Tweet[] = [];
  // const seenIdsThisSession = new Set<string>();

  try {
    console.log("🔍 Starting tweet scraping...");

    // Wait for either tweets or "no tweets" indicator
    const hasContent = await Promise.race([
      page
        .waitForSelector('article[role="article"]', { timeout: 30000 })
        .then(() => true)
        .catch(() => false),
      page
        .waitForSelector('[data-testid="empty-timeline"]', { timeout: 30000 })
        .then(() => false)
        .catch(() => true),
    ]);

    if (!hasContent) {
      console.log("No tweets found in timeline");
      return tweets;
    }

    const articles = await page.locator('article[role="article"]').all();
    console.log(`Found ${articles.length} total tweets on list page`);

    for (const article of articles) {
      try {
        const usernameHandle = await article
          .locator('a[role="link"]', { hasText: /@/ })
          .first();
        await usernameHandle.waitFor({ state: "visible", timeout: 5000 });
        const username = ((await usernameHandle.textContent()) || "")
          .replace("@", "")
          .trim()
          .toLowerCase();

        const tweetLink = await article.locator('a[href*="/status/"]').first();
        const href = await tweetLink.getAttribute("href");
        let id = "";
        if (href) {
          const match = href.match(/status\/(\d+)/);
          if (match) id = match[1];
        }

        if (username && id) {
          const text =
            (await article
              .locator('[data-testid="tweetText"]')
              .textContent()) || "";
          // Collect all image URLs in the tweet
          const imageLocators = await article
            .locator('img, [data-testid="tweetPhoto"] img')
            .all();
          const images: string[] = [];
          for (const img of imageLocators) {
            const src = await img.getAttribute("src");
            if (src && !images.includes(src)) images.push(src);
          }
          if (text) {
            console.log(`Processing tweet from @${username}`);
            tweets.push({
              id,
              username,
              author: username,
              text,
              fullText: text,
              images,
              createdTime: new Date().toISOString(),
              isRepost: false,
              element: article,
            });
          }
        }
      } catch (error) {
        console.log("Error processing individual tweet:", error);
      }
    }

    return tweets;
  } catch (error) {
    console.error("Error scraping tweets:", error);
    return [];
  }
}

/**
 * Posts a reply to a specific tweet.
 */
async function postReply(tweet: Tweet, replyText: string): Promise<boolean> {
  try {
    // Add short random delay for testing (1-2 seconds)
    const delayMs = 1000 + Math.floor(Math.random() * 1000);
    console.log(
      `Waiting ${Math.round(delayMs / 1000)}s before replying to @${tweet.username}...`,
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    console.log(`Replying to @${tweet.username}...`);
    await tweet.element.locator('[data-testid="reply"]').click();

    // Try to find the reply editor inside the same article (tweet)
    let replyEditor = tweet.element.locator(".public-DraftEditor-content");
    try {
      await replyEditor.waitFor({ state: "visible", timeout: 3000 });
    } catch {
      // fallback: try global (page) editor
      replyEditor = tweet.element.page().locator(".public-DraftEditor-content");
      try {
        await replyEditor.waitFor({ state: "visible", timeout: 3000 });
        console.warn(
          "⚠️ Reply editor not found in tweet article, using global editor.",
        );
      } catch {
        console.error("❌ Could not find any visible reply editor.");
        throw new Error("Reply editor not found");
      }
    }

    // Type reply with human-like delay
    for (const char of replyText) {
      await replyEditor.type(char, { delay: Math.random() * 100 + 50 });
    }

    // Random pause before clicking post (0.5-2 seconds)
    await new Promise((resolve) =>
      setTimeout(resolve, 500 + Math.random() * 1500),
    );

    const postButton = tweet.element
      .page()
      .locator('[data-testid="tweetButton"]');
    await postButton.click();

    console.log(`✅ Reply posted: "${replyText}"`);
    await tweet.element.page().waitForTimeout(3000);
    return true;
  } catch (error) {
    console.error(`❌ Failed to post reply to @${tweet.username}:`, error);
    logError(`Failed to post reply: ${error}`, tweet.username);
    await tweet.element.page().reload();
    return false;
  }
}

// --- Main Agent Logic ---

async function main() {
  console.log("--- Starting Single Chrome Agent (Interactive) ---");
  console.log(`Mode: ${config.browser.headless ? "headless" : "interactive"}`);

  // Connect to the dashboard server for IPC
  dashboard.initAsAgentClient();

  // Initialize backup system
  await startBackupScheduler().catch(console.error);

  // Ensure singleton, persistent session
  const { page } = await ensureSession(LIST_URL);
  let attachedPage: Page | null = null;
  function isLevel(x: string): x is "log" | "info" | "warn" | "error" | "debug" {
    return (
      x === "log" ||
      x === "info" ||
      x === "warn" ||
      x === "error" ||
      x === "debug"
    );
  }
  function attachPageEvents(p: Page) {
    if (attachedPage === p) return;
    attachedPage = p;
    p.on("console", (msg) => {
      const type = msg.type();
      const txt = msg.text();
      // forward to dashboard
      const lvl: "log" | "info" | "warn" | "error" | "debug" = isLevel(type)
        ? type
        : "log";
      logPageConsole(lvl, txt);
    });
    p.on("pageerror", (err) => {
      logException(err?.message || String(err));
    });
  }
  attachPageEvents(page);

  // Start lightweight screencap loop (configurable)
  let screencapIntervalMs = 3000;
  let scTimer: NodeJS.Timeout | null = null;
  async function doScreencapOnce() {
    try {
      const sess = await ensureSession(LIST_URL);
      const p = sess.page;
      attachPageEvents(p);
      const buf = await p.screenshot({
        type: "jpeg",
        quality: 60,
        fullPage: false,
      });
      const dataUrl = `data:image/jpeg;base64,${buf.toString("base64")}`;
      sendScreencap(dataUrl, p.url());
    } catch {}
  }
  function scheduleScreencap() {
    if (scTimer) clearInterval(scTimer);
    scTimer = setInterval(doScreencapOnce, screencapIntervalMs);
  }
  control.on("screencapMs", (ms: unknown) => {
    const v = Number(ms);
    if (Number.isFinite(v) && v >= 200 && v <= 60000) {
      screencapIntervalMs = Math.round(v);
      scheduleScreencap();
    }
  });
  scheduleScreencap();

  async function navigateToList(): Promise<void> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    // Configure viewport for better reliability
    await page.setViewportSize({ width: 1280, height: 800 });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Navigation attempt ${attempt}/${maxRetries}`);

        // Check for rate limiting
        const rateLimited = await page
          .locator('text="Rate limit exceeded"')
          .count()
          .catch(() => 0);

        if (rateLimited > 0) {
          console.log("Rate limit detected, waiting 15 minutes...");
          await page.waitForTimeout(15 * 60 * 1000);
        }

        // Step 1: Load home page first
        console.log("Loading home page...");
        await page.goto("https://x.com/home", {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });

        // Step 2: Verify home page loaded
        await Promise.race([
          page.waitForSelector('[data-testid="primaryColumn"]', {
            timeout: 20000,
          }),
          page.waitForSelector('article[role="article"]', { timeout: 20000 }),
        ]);

        console.log("✅ Home page loaded");
        await page.waitForTimeout(2000);

        // Step 3: Navigate to list
        console.log(`Loading list: ${LIST_URL}`);
        const response = await page.goto(LIST_URL, {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        });

        if (!response?.ok()) {
          throw new Error(`List navigation failed: ${response?.status()}`);
        }

        // Step 4: Verify list URL
        const currentUrl = page.url();
        if (!currentUrl.includes("lists/")) {
          throw new Error(`Wrong page: ${currentUrl}`);
        }

        // Step 5: Wait for list content
        const content = await Promise.race([
          page.waitForSelector('article[role="article"]', { timeout: 30000 }),
          page.waitForSelector('[data-testid="ListHeader"]', {
            timeout: 30000,
          }),
        ]);

        if (!content) {
          throw new Error("List content not found");
        }

        console.log("✅ List page loaded successfully");
        return;
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt} failed:`, error);

        if (attempt === maxRetries) {
          throw new Error(
            `Failed to load list after ${maxRetries} attempts: ${lastError.message}`,
          );
        }

        console.log(`Waiting ${5000 / 1000}s before retry...`);
        await page.waitForTimeout(5000);
      }
    }

    throw new Error("Navigation failed: Could not verify list page");
  }

  try {
    console.log(`Ensuring initial navigation to active source: ${LIST_URL}`);
    // Only navigate if we're already on list domain; otherwise, user is interacting elsewhere
    if (page.url() === "about:blank" || page.url().includes("x.com")) {
      await navigateToList();
    } else {
      console.log("🔶 User navigated elsewhere; leaving page as-is.");
    }
    console.log("✅ Ready and keeping tab open.");
  } catch (error: unknown) {
    console.error("Initial navigation failed:", error);
  }

  console.log(`Processing initial ${INITIAL_POST_LIMIT} recent posts...`);
  const recentTweets = (await scrapeTweetsFromList(page)).slice(
    0,
    INITIAL_POST_LIMIT,
  );

  for (const tweet of recentTweets) {
    if (!isSeen(tweet.id)) {
      console.log(
        `[INIT] New post from @${tweet.username}: "${tweet.text.slice(0, 60)}..."`,
      );
      logTweetProcessed(tweet.username, tweet.text);

      const profile = getProfile(tweet.username) as ProfileWithFacts;
      if (profile) {
        let prompt = profile.customPrompt.replace("{{TWEET_TEXT}}", tweet.text);
        if (tweet.images && tweet.images.length > 0) {
          prompt += `\nAttached images: ${tweet.images.join(", ")}`;
        }
        if (profile.facts?.length) {
          const randomFact =
            profile.facts[Math.floor(Math.random() * profile.facts.length)];
          prompt = prompt.replace("{{FACT}}", randomFact);
        }

        const startTime = Date.now();
        const reply = await askGPT(prompt);
        const responseTime = Date.now() - startTime;

        logGeminiCall("gemini-1.5-flash", responseTime, !!reply);

        if (reply) {
          const success = await postReply(tweet, reply);
          logReplyPosted(tweet.username, reply, success);
          if (success) {
            markSeen(tweet.id);
          }
        } else {
          console.log("GPT response was empty. Skipping reply.");
        }
      } else {
        console.warn(`No profile found for @${tweet.username}. Cannot reply.`);
      }

      console.log(
        `Waiting ${INITIAL_REPLY_DELAY_MS / 1000}s before next initial reply...`,
      );
      await new Promise((res) => setTimeout(res, INITIAL_REPLY_DELAY_MS));
    }
  }

  console.log("✅ Initial processing complete.");

  // Rate limiting + backoff state
  let repliesThisHour = 0;
  let repliesToday = 0;
  let hourWindowStart = Date.now();
  let dayWindowStart = Date.now();
  let consecutiveErrors = 0;
  let scanning = false; // guard to prevent overlap

  function withinHourWindow() {
    const now = Date.now();
    if (now - hourWindowStart >= 60 * 60 * 1000) {
      hourWindowStart = now;
      repliesThisHour = 0;
    }
  }
  function withinDayWindow() {
    const now = Date.now();
    if (now - dayWindowStart >= 24 * 60 * 60 * 1000) {
      dayWindowStart = now;
      repliesToday = 0;
    }
  }

  async function canReply(): Promise<boolean> {
    withinHourWindow();
    withinDayWindow();
    if (repliesThisHour >= config.agent.rateLimit.maxRequestsPerHour)
      return false;
    if (
      repliesToday >=
      ((config.agent.rateLimit as { maxTweetsPerDay?: number })
        .maxTweetsPerDay || 50)
    )
      return false;
    return true;
  }

  function noteReply() {
    repliesThisHour += 1;
    repliesToday += 1;
  }

  let paused = false;
  control.on("pause", (val: unknown) => {
    paused = !!val;
  });
  control.on("reset", async () => {
    try {
      await ensureSession(LIST_URL);
      logAgentLog("Session reset completed");
    } catch (e) {
      logError(`Reset failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  });

  async function handleLogin(creds: { user: string; pass: string }) {
    try {
      const sess = getSingleton();
      if (!sess) return;
      const page = sess.page;
      logAgentLog(`Attempting login for ${creds.user}...`);
      await page.fill('input[name="text"]', creds.user);
      await page.locator("span", { hasText: "Next" }).click();
      await page.fill('input[name="password"]', creds.pass);
      await page.locator('[data-testid="LoginForm_Login_Button"]').click();
      await page.waitForNavigation({
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      logAgentLog("Login submitted successfully.");
    } catch (e) {
      logError(`Login failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  control.on("credentials", (creds: unknown) => {
    if (
      creds &&
      typeof creds === "object" &&
      "user" in creds &&
      "pass" in creds
    ) {
      handleLogin(creds as { user: string; pass: string });
    }
  });

  while (true) {
    if (paused) {
      await new Promise((res) => setTimeout(res, POLLING_INTERVAL_MS));
      continue;
    }
    if (scanning) {
      console.log("⏳ Scan already in progress; skipping this tick.");
      await new Promise((res) => setTimeout(res, POLLING_INTERVAL_MS));
      continue;
    }

    scanning = true;
    try {
      // Ensure session is alive (recover if closed). This will recreate at most one window.
      const sess = await ensureSession(LIST_URL);
      const p = sess.page;

      console.log(`\n--- Scan start [${new Date().toLocaleTimeString()}] ---`);
      let repliesThisScan = 0;

      // If user navigated elsewhere, do not steal focus or navigate; just skip this cycle.
      const url = p.url();
      if (
        !url.includes("x.com") ||
        (!url.includes("/lists/") && !url.includes("/notifications"))
      ) {
        console.log(
          "🟡 User is interacting elsewhere; skipping scan to remain non-intrusive.",
        );
      } else {
        // Light refresh only if still on list/notifications
        try {
          await p.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
          console.log("🔁 Page reloaded.");
        } catch (err) {
          console.error("Reload failed:", err);
          throw err;
        }

        const currentTweets = await scrapeTweetsFromList(p);
        console.log(`📋 Tweets scraped: ${currentTweets.length}`);

        for (const tweet of currentTweets) {
          if (!isSeen(tweet.id)) {
            console.log(
              `[NEW] @${tweet.username}: "${tweet.text.slice(0, 60)}..."`,
            );
            if (!(await canReply())) {
              console.log(
                "⛔ Rate limit reached for this window; skipping replies.",
              );
              break;
            }

            const profile = getProfile(tweet.username) as ProfileWithFacts;
            if (profile) {
              let prompt = profile.customPrompt.replace(
                "{{TWEET_TEXT}}",
                tweet.text,
              );
              if (profile.facts?.length) {
                const randomFact =
                  profile.facts[
                    Math.floor(Math.random() * profile.facts.length)
                  ];
                prompt = prompt.replace("{{FACT}}", randomFact);
              }

              const reply = await askGPT(prompt);
              if (reply) {
                if (await postReply(tweet, reply)) {
                  markSeen(tweet.id);
                  noteReply();
                  repliesThisScan += 1;
                  break; // one reply per scan cycle
                }
              }
            }
          }
        }
      }

      consecutiveErrors = 0;
      console.log(`Replies posted: ${repliesThisScan}`);
      console.log("--- Scan end.");
    } catch (error) {
      consecutiveErrors += 1;
      console.error("❌ Error in scan loop:", error);
      logError(`Scan loop error: ${error}`);
    } finally {
      scanning = false;
    }

    const backoff = Math.min(
      POLLING_INTERVAL_MS * Math.pow(2, Math.max(0, consecutiveErrors - 1)),
      5 * 60 * 1000,
    );
    const sleepMs = Math.max(POLLING_INTERVAL_MS, backoff);
    console.log(`⏱️ Waiting ${Math.round(sleepMs / 1000)}s before next scan.`);
    await new Promise((res) => setTimeout(res, sleepMs));
  }
}

process.on("uncaughtException", (err) => {
  logException(`uncaughtException: ${err?.message || String(err)}`);
});
process.on("unhandledRejection", (reason) => {
  logException(
    `unhandledRejection: ${reason instanceof Error ? reason.message : String(reason)}`,
  );
});

main().catch((e) => {
  logException(`main() failed: ${e instanceof Error ? e.message : String(e)}`);
  console.error(e);
});


