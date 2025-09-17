// src/watchList.ts
import { Page } from 'playwright';
import { ensureSession } from './browser';
import { isSeen, markSeen, registerGracefulShutdown } from './memory';
import { getProfileByHandle, Profile } from './profile-manager';
import { config } from './config';
import { askGemini } from '../ai/gemini';
import { logHandledTweet } from './logging';

// --- Constants from Central Config ---
const LIST_URL = config.twitter.listUrl;
const TARGET_USERNAMES = new Set(Array.from(config.twitter.targetUsernames).map(u => u.toLowerCase()));
const POLLING_INTERVAL_MS = config.agent.pollingIntervalMs;
const INITIAL_REPLY_DELAY_MS = config.agent.initialReplyDelayMs;
const ACTION_TIMEOUT_MS = config.agent.actionTimeoutMs;
const INITIAL_POST_LIMIT = config.agent.initialPostLimit;

// Keywords to check for relevance (Israel/Palestine context)
const RELEVANCE_KEYWORDS = [
    'israel', 'palestine', 'gaza', 'hamas', 'idf', 'zionism', 'zionist', 
    'jerusalem', 'west bank', 'middle east', 'conflict', 'occupation',
    'palestinian', 'israeli', 'hezbollah', 'iran', 'lebanon', 'syria',
    'settlers', 'apartheid', 'genocide', 'war crimes', 'human rights', 
    'ceasefire', 'hostages', 'rockets', 'intifada', 'dome', 'iron dome'
];

// --- Types ---
interface Tweet {
    id: string;
    username: string;
    text: string;
    element: any; // Playwright Locator
}

// --- Helper Functions ---

/**
 * Checks if the tweet text contains any of the relevance keywords.
 */
function isTweetRelevant(text: string): boolean {
    const lowerText = text.toLowerCase();
    return RELEVANCE_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

/**
 * Scrapes tweets from the list page, filtering for target users.
 */
async function scrapeTweetsFromList(page: Page): Promise<Tweet[]> {
    const tweets: Tweet[] = [];
    
    try {
        console.log('🔍 Starting tweet scraping...');
        await page.waitForSelector('article[role="article"]', { timeout: 30000 });
        const articles = await page.locator('article[role="article"]').all();
        console.log(`Found ${articles.length} total tweets on page.`);

        for (const article of articles) {
            try {
                // Find the username handle within the article scope
                const userHandleElement = await article.locator('a[role="link"] div[dir="ltr"]').first();
                const userHandleText = await userHandleElement.innerText();
                const username = userHandleText.replace('@', '').trim().toLowerCase();

                // Find the link to the tweet to extract its ID
                const tweetLinkElement = await article.locator('a[href*="/status/"]').first();
                const href = await tweetLinkElement.getAttribute('href');
                
                let id = '';
                if (href) {
                    const match = href.match(/status\/(\d+)/);
                    if (match) id = match[1];
                }

                if (username && id && TARGET_USERNAMES.has(username)) {
                    const text = await article.locator('[data-testid="tweetText"]').textContent() || '';
                    if (text && isTweetRelevant(text)) {
                        console.log(`Found relevant tweet from @${username}`);
                        tweets.push({ id, username, text, element: article });
                    }
                }
            } catch (error) {
                // It's common for some articles not to be tweets, so we log softly
                // console.log('Could not process an article, likely a non-tweet element.');
            }
        }
        
        return tweets;
    } catch (error) {
        console.error('Error scraping tweets from list:', error);
        return [];
    }
}

/**
 * Posts a reply to a specific tweet.
 */
async function postReply(page: Page, tweet: Tweet, replyText: string): Promise<boolean> {
    if (!replyText || replyText.trim() === '') {
        console.warn(`⚠️ Gemini returned an empty response for tweet ${tweet.id}. Skipping reply.`);
        return false;
    }

    try {
        console.log(`Attempting to reply to @${tweet.username}'s tweet ${tweet.id}`);
        
        // Click the reply button on the specific tweet article
        await tweet.element.locator('[data-testid="reply"]').click({ timeout: ACTION_TIMEOUT_MS });
        
        // The reply editor/modal is now part of the main page document
        const replyEditor = page.locator('.public-DraftEditor-content[aria-label="Tweet text"]');
        await replyEditor.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT_MS });
        
        console.log("Filling reply editor...");
        await replyEditor.fill(replyText);
        
        // Find the "Post" button in the composer and click it
        const postButton = page.locator('[data-testid="tweetButton"]');
        await postButton.click({ timeout: ACTION_TIMEOUT_MS });
        
        console.log(`✅ Reply posted successfully: "${replyText}"`);
        logHandledTweet(tweet.id, replyText);

        // Wait a moment for the UI to update, then reload to clear the composer state
        await page.waitForTimeout(5000); 
        await page.reload({ waitUntil: 'domcontentloaded' });

        return true;
    } catch (error) {
        console.error(`❌ Failed to post reply to tweet ${tweet.id}:`, error);
        // Reload the page to recover from a potentially broken state
        await page.reload({ waitUntil: 'domcontentloaded' });
        return false;
    }
}


// --- Main Agent Logic ---

async function main() {
    console.log('--- 🚀 Starting Twitter List Agent ---');
    registerGracefulShutdown();
    const { page } = await ensureSession();

    // Initial navigation
    try {
        console.log(`Navigating to list: ${LIST_URL}`);
        await page.goto(LIST_URL, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForSelector('article[role="article"]', { timeout: 30000 });
        console.log('✅ Navigation to list complete.');
    } catch (err) {
        console.error('❌ Initial navigation to list failed. The agent will exit.', err);
        process.exit(1);
    }
    
    // Main polling loop
    while (true) {
        try {
            console.log(`\n--- 🔄 Refreshing list [${new Date().toLocaleTimeString()}] ---`);
            await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
            
            const currentTweets = await scrapeTweetsFromList(page);
            console.log(`Found ${currentTweets.length} relevant tweets from target users.`);

            for (const tweet of currentTweets) {
                const seen = await isSeen(tweet.id);
                if (!seen) {
                    console.log(`[NEW] New post from @${tweet.username}: "${tweet.text.slice(0, 80)}..."`);
                    
                    const profile = await getProfileByHandle(tweet.username);
                    if (profile) {
                        let prompt = profile.customPrompt.replace('{{TWEET_TEXT}}', tweet.text);
                        if (profile.facts?.length) {
                            const randomFact = profile.facts[Math.floor(Math.random() * profile.facts.length)];
                            prompt = prompt.replace('{{FACT}}', randomFact);
                        }

                        console.log(`🤖 Generating reply for tweet ${tweet.id}...`);
                        const reply = await askGemini(prompt);
                        
                        if (await postReply(page, tweet, reply)) {
                            await markSeen(tweet.id);
                             // Wait before processing the next tweet to appear more human
                            console.log(`Waiting ${INITIAL_REPLY_DELAY_MS / 1000}s before next action...`);
                            await new Promise(res => setTimeout(res, INITIAL_REPLY_DELAY_MS));
                        }
                    } else {
                        console.warn(`⚠️ No profile found for @${tweet.username}. Cannot reply.`);
                        await markSeen(tweet.id); // Mark as seen to avoid re-processing
                    }
                }
            }
        } catch (error) {
            console.error('An error occurred in the main loop:', error);
            console.log('Attempting to recover by waiting and continuing...');
        }

        console.log(`--- ✅ Cycle complete. Waiting for ${POLLING_INTERVAL_MS / 1000}s ---`);
        await new Promise(res => setTimeout(res, POLLING_INTERVAL_MS));
    }
}

main().catch(error => {
    console.error("A fatal error occurred in the agent's main function:", error);
    process.exit(1);
});
