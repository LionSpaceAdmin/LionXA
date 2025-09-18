"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureSession = ensureSession;
exports.getSingleton = getSingleton;
// src/browser.ts
const playwright_1 = require("playwright");
const fs = __importStar(require("fs/promises"));
const fssync = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("./config");
// --- Singleton State ---
let singleton = null;
let recovering = false;
let contextClosed = false;
// --- Helpers ---
function ensureDirSync(dir) {
    if (!fssync.existsSync(dir)) {
        fssync.mkdirSync(dir, { recursive: true });
    }
}
function logSessionInit(startUrl, userDataDir, pid) {
    const mode = config_1.config.browser.headless ? 'headless' : 'interactive';
    console.log(`🧭 Session init: url=${startUrl}`);
    console.log(`👤 Profile: ${userDataDir}`);
    console.log(`🧩 Mode: ${mode}`);
    if (pid)
        console.log(`🆔 Chromium PID: ${pid}`);
    // Single-line proof log for validators
    console.log(`Session init: url=${startUrl}, profile=${userDataDir}, Engine=Chromium, PID=${pid ?? 'n/a'}, mode=${mode}`);
}
async function createPersistentContext(startUrl) {
    ensureDirSync(config_1.config.browser.userDataDir);
    const context = await playwright_1.chromium.launchPersistentContext(config_1.config.browser.userDataDir, {
        headless: config_1.config.browser.headless,
        args: [
            '--disable-infobars',
            '--no-default-browser-check',
            '--no-first-run',
        ],
        viewport: { width: 1280, height: 860 },
    });
    const browser = context.browser();
    const pid = browser?.process?.()?.pid;
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
    }
    catch (e) {
        console.warn('⚠️ Failed to import legacy cookies.json (continuing):', e);
    }
    logSessionInit(startUrl, config_1.config.browser.userDataDir, pid);
    // Only navigate once on brand-new session
    try {
        if (page.url() === 'about:blank') {
            await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        }
    }
    catch (err) {
        console.warn('Navigation on init failed, user may navigate manually:', err);
    }
    // Guard against extra windows/tabs created by our code
    const pages = context.pages();
    if (pages.length > 1) {
        // Keep the first page only; close any extra pages we may have opened
        for (let i = 1; i < pages.length; i++) {
            try {
                await pages[i].close({ runBeforeUnload: true });
            }
            catch { }
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
async function ensureSession(startUrl) {
    const targetUrl = startUrl || config_1.config.browser.startUrl;
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
        if (singleton?.context) {
            try {
                await singleton.context.close();
            }
            catch { }
        }
        contextClosed = false;
        return await createPersistentContext(targetUrl);
    }
    finally {
        recovering = false;
    }
}
function getSingleton() {
    if (singleton && !contextClosed && singleton.page && !singleton.page.isClosed()) {
        return { browser: singleton.browser, context: singleton.context, page: singleton.page };
    }
    return null;
}
