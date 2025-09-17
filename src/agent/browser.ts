// src/browser.ts
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as fs from 'fs/promises';
import * as fssync from 'fs';
import * as path from 'path';
import { config } from './config';

// --- Types ---
export interface BrowserSession {
  browser: Browser | null;
  context: BrowserContext;
  page: Page;
}

// --- Singleton State ---
let singleton: { context: BrowserContext; page: Page; browser: Browser | null; startUrl: string; pid?: number } | null = null;
let recovering = false;
let contextClosed = false;

// --- Helpers ---
function ensureDirSync(dir: string) {
  if (!fssync.existsSync(dir)) {
    fssync.mkdirSync(dir, { recursive: true });
  }
}

function logSessionInit(startUrl: string, userDataDir: string, pid?: number) {
  const mode = config.browser.headless ? 'headless' : 'interactive';
  console.log(`🧭 Session init: url=${startUrl}`);
  console.log(`👤 Profile: ${userDataDir}`);
  console.log(`🧩 Mode: ${mode}`);
  if (pid) console.log(`🆔 Chromium PID: ${pid}`);
  // Single-line proof log for validators
  console.log(`Session init: url=${startUrl}, profile=${userDataDir}, Engine=Chromium, PID=${pid ?? 'n/a'}, mode=${mode}`);
}

async function createPersistentContext(startUrl: string): Promise<BrowserSession> {
  ensureDirSync(config.browser.userDataDir);

  const context = await chromium.launchPersistentContext(config.browser.userDataDir, {
    headless: config.browser.headless,
    args: [
      '--disable-infobars',
      '--no-default-browser-check',
      '--no-first-run',
    ],
    viewport: { width: 1280, height: 860 },
  });

  const browser = context.browser();
  const pid = (browser as any)?.process?.()?.pid as number | undefined;

  let page = context.pages()[0];
  if (!page) {
    page = await context.newPage();
  }

  // One-time seeding: if legacy cookies.json exists, import into persistent profile
  try {
    const legacyCookiesPath = path.resolve(__dirname, '../cookies.json');
    if (fssync.existsSync(legacyCookiesPath)) {
      const raw = await fs.readFile(legacyCookiesPath, 'utf-8');
      const legacy = JSON.parse(raw);
      if (Array.isArray(legacy) && legacy.length > 0) {
        await context.addCookies(legacy);
        console.log(`🍪 Imported ${legacy.length} legacy cookies from cookies.json`);
      }
    }
  } catch (e) {
    console.warn('⚠️ Failed to import legacy cookies.json (continuing):', e);
  }

  logSessionInit(startUrl, config.browser.userDataDir, pid);

  // Only navigate once on brand-new session
  try {
    if (page.url() === 'about:blank') {
      await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    }
  } catch (err) {
    console.warn('Navigation on init failed, user may navigate manually:', err);
  }

  // Guard against extra windows/tabs created by our code
  const pages = context.pages();
  if (pages.length > 1) {
    // Keep the first page only; close any extra pages we may have opened
    for (let i = 1; i < pages.length; i++) {
      try { await pages[i].close({ runBeforeUnload: true }); } catch {}
    }
  }

  // Resilience: if the page is closed or crashes, we will recreate on next ensureSession()
  page.on('close', () => {
    console.log('📕 Page closed. Will recreate on next cycle.');
  });
  context.on('close', () => {
    console.log('🧯 Context closed. Will recreate on next cycle.');
    contextClosed = true;
  });

  singleton = { context, page, browser: browser ?? null, startUrl };
  return { browser: browser ?? null, context, page };
}

// --- Public API ---
export async function ensureSession(startUrl?: string): Promise<BrowserSession> {
  const targetUrl = startUrl || config.browser.startUrl;

  // If already have a healthy session, reuse it
  if (singleton && !contextClosed && singleton.page && !singleton.page.isClosed()) {
    return { browser: singleton.browser, context: singleton.context, page: singleton.page };
  }

  if (recovering) {
    // Avoid concurrent recoveries
    await new Promise(res => setTimeout(res, 1000));
    if (singleton && !contextClosed && singleton.page && !singleton.page.isClosed()) {
      return { browser: singleton.browser, context: singleton.context, page: singleton.page };
    }
  }

  recovering = true;
  try {
    if (singleton?.context) { try { await singleton.context.close(); } catch {} }
    contextClosed = false;
    return await createPersistentContext(targetUrl);
  } finally {
    recovering = false;
  }
}

export function getSingleton(): BrowserSession | null {
  if (singleton && !contextClosed && singleton.page && !singleton.page.isClosed()) {
    return { browser: singleton.browser, context: singleton.context, page: singleton.page };
  }
  return null;
}
