// src/watchList.ts
import { Page } from 'playwright';
import { startBrowserSession } from './browser';
import { isSeen, markSeen } from './memory';
import { getProfile, Profile } from './profiles';
import { config } from './config';
// Assuming you have a function to interact with Gemini
import { askGemini } from '../ai/genkit'; // Placeholder for Gemini function

// --- Constants from Central Config ---
const LIST_URL = config.twitter.listUrl;
const TARGET_USERNAMES = config.twitter.targetUsernames;
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
    element: any;
}

interface ProfileWithFacts extends Profile {
    facts?: string[];
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
        console.log(`Found ${articles.length} total tweets`);

        for (const article of articles) {
            try {
                const usernameHandle = await article.locator('a[role="link"]', { hasText: /@/ }).first();
                await usernameHandle.waitFor({ state: 'visible', timeout: 5000 });
                const username = (await usernameHandle.textContent() || '').replace('@', '').trim().toLowerCase();

                const tweetLink = await article.locator('a[href*="/status/"]').first();
                const href = await tweetLink.getAttribute('href');
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
                console.log('Error processing individual tweet:', error);
            }
        }
        
        return tweets;
    } catch (error) {
        console.error('Error scraping tweets:', error);
        return [];
    }
}

/**
 * Posts a reply to a specific tweet.
 */
async function postReply(tweet: Tweet, replyText: string): Promise<boolean> {
    try {
        console.log(`Replying to @${tweet.username}...`);
        await tweet.element.locator('[data-testid="reply"]').click();
        
        const replyEditor = tweet.element.page().locator('.public-DraftEditor-content');
        await replyEditor.waitFor({ state: 'visible', timeout: ACTION_TIMEOUT_MS });
        await replyEditor.fill(replyText);
        
        const postButton = tweet.element.page().locator('[data-testid="tweetButton"]');
        await postButton.click();
        
        console.log(`✅ Reply posted: "${replyText}"`);
        await tweet.element.page().waitForTimeout(3000);
        return true;
    } catch (error) {
        console.error(`❌ Failed to post reply to @${tweet.username}:`, error);
        await tweet.element.page().reload();
        return false;
    }
}

// --- Main Agent Logic ---

async function main() {
    console.log('--- Starting Twitter List Agent ---');
    const { page } = await startBrowserSession();

    console.log(`Navigating to list: ${LIST_URL}`);
    try {
        console.log(`Attempting to navigate to: ${LIST_URL}`);
        await page.goto(LIST_URL, { waitUntil: 'networkidle', timeout: 60000 });
        
        // Verify we're on the correct page
        const currentUrl = page.url();
        if (!currentUrl.includes('lists/')) {
            console.error(`Navigation failed: Expected URL with 'lists/', but got ${currentUrl}`);
            throw new Error('Navigation verification failed');
        }
        
        // Wait for the list content to load
        await page.waitForSelector('article[role="article"]', { timeout: 30000 });
        console.log('✅ Navigation to list completed and verified.');
    } catch (err) {
        console.error('Navigation to list failed:', err);
        throw err;
    }
    
    console.log(`Processing initial ${INITIAL_POST_LIMIT} recent posts...`);
    const recentTweets = (await scrapeTweetsFromList(page)).slice(0, INITIAL_POST_LIMIT);
    
    for (const tweet of recentTweets) {
        if (!isSeen(tweet.id)) {
            console.log(`[INIT] New post from @${tweet.username}: "${tweet.text.slice(0, 60)}..."`);
            
            const profile = getProfile(tweet.username) as ProfileWithFacts;
            if (profile) {
                let prompt = `${profile.customPrompt}\n\nTweet: ${tweet.text}`;
                if (profile.facts?.length) {
                    const randomFact = profile.facts[Math.floor(Math.random() * profile.facts.length)];
                    prompt = prompt.replace('{{FACT}}', randomFact);
                }

                const reply = await askGemini(prompt);
                if (reply) {
                    if (await postReply(tweet, reply)) {
                        markSeen(tweet.id);
                    }
                } else {
                    console.log('Gemini response was empty. Skipping reply.');
                }
            } else {
                console.warn(`No profile found for @${tweet.username}. Cannot reply.`);
            }
            
            console.log(`Waiting ${INITIAL_REPLY_DELAY_MS / 1000}s before next initial reply...`);
            await new Promise(res => setTimeout(res, INITIAL_REPLY_DELAY_MS));
        }
    }
    
    console.log('✅ Initial processing complete.');

    while (true) {
        try {
            console.log(`\n--- Refreshing list [${new Date().toLocaleTimeString()}] ---`);
            try {
                await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
                console.log('List reload completed.');
            } catch (err) {
                console.error('List reload failed:', err);
                throw err;
            }
            
            const currentTweets = await scrapeTweetsFromList(page);
            console.log(`Found ${currentTweets.length} tweets from target users.`);

            for (const tweet of currentTweets) {
                if (!isSeen(tweet.id)) {
                    console.log(`[NEW] New post from @${tweet.username}: "${tweet.text.slice(0, 60)}..."`);
                    
                    const profile = getProfile(tweet.username) as ProfileWithFacts;
                    if (profile) {
                        let prompt = `${profile.customPrompt}\n\nTweet: ${tweet.text}`;
                        if (profile.facts?.length) {
                            const randomFact = profile.facts[Math.floor(Math.random() * profile.facts.length)];
                            prompt = prompt.replace('{{FACT}}', randomFact);
                        }

                        const reply = await askGemini(prompt);
                        if (reply) {
                            if (await postReply(tweet, reply)) {
                                markSeen(tweet.id);
                                break;
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('An error occurred in the main loop:', error);
            await page.waitForTimeout(POLLING_INTERVAL_MS);
        }

        console.log(`--- Cycle complete. Waiting for ${POLLING_INTERVAL_MS / 1000}s ---`);
        await new Promise(res => setTimeout(res, POLLING_INTERVAL_MS));
    }
}

main().catch(console.error);
