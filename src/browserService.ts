// src/browserService.ts
import { chromium, firefox, webkit, Browser, Page, BrowserType } from 'playwright';
import { config } from './config';

type BrowserName = 'chromium' | 'firefox' | 'webkit';

interface SteelSession {
  id: string;
  endpoint: string;
}

class BrowserService {
  private browser: Browser | null = null;
  private steelSession: SteelSession | null = null;
  private static instance: BrowserService;

  private constructor() {}

  public static getInstance(): BrowserService {
    if (!BrowserService.instance) {
      BrowserService.instance = new BrowserService();
    }
    return BrowserService.instance;
  }

  private async createSteelSession(): Promise<SteelSession> {
    const response = await fetch(`${config.steel.apiUrl}/v1/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.steel.apiKey && { 'Authorization': `Bearer ${config.steel.apiKey}` }),
      },
      body: JSON.stringify({
        sessionTimeout: 300, // 5 minutes
        solve: true,
        metadata: {
          source: 'LionXA-Agent'
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create Steel session: ${response.statusText}`);
    }

    const session = await response.json();
    console.log(`🔧 Steel Browser session created: ${session.id}`);
    return {
      id: session.id,
      endpoint: `http://localhost:9222` // Use default CDP endpoint
    };
  }

  private async connectToSteelBrowser(): Promise<Browser> {
    if (!this.steelSession) {
      this.steelSession = await this.createSteelSession();
    }

    // Connect Playwright to Steel Browser via CDP
    this.browser = await chromium.connectOverCDP(this.steelSession.endpoint);
    console.log(`🚀 Connected to Steel Browser session: ${this.steelSession.id}`);

    return this.browser;
  }

  public async initialize(browserType: BrowserName = 'chromium'): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    // Use Steel Browser if enabled
    if (config.steel.enabled) {
      console.log('🔧 Initializing Steel Browser...');
      return await this.connectToSteelBrowser();
    }

    // Fallback to local Playwright browser
    let browserLauncher: BrowserType;
    switch (browserType) {
      case 'firefox':
        browserLauncher = firefox;
        break;
      case 'webkit':
        browserLauncher = webkit;
        break;
      case 'chromium':
      default:
        browserLauncher = chromium;
        break;
    }

    this.browser = await browserLauncher.launch({
      headless: config.browser.headless,
      slowMo: config.browser.slowMo,
      args: config.browser.extraArgs,
      devtools: config.browser.devtools,
    });

    return this.browser;
  }

  public async getPage(): Promise<Page> {
    if (!this.browser) {
      await this.initialize(config.browser.channel as BrowserName);
    }
    // We can safely assert that this.browser is not null here
    // because initialize() will throw an error if it fails.
    return this.browser!.newPage();
  }

  public async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    // Close Steel session if it exists
    if (this.steelSession && config.steel.enabled) {
      try {
        await fetch(`${config.steel.apiUrl}/v1/sessions/${this.steelSession.id}`, {
          method: 'DELETE',
          headers: {
            ...(config.steel.apiKey && { 'Authorization': `Bearer ${config.steel.apiKey}` }),
          },
        });
        console.log(`🗑️ Steel Browser session closed: ${this.steelSession.id}`);
      } catch (error) {
        console.warn('Failed to close Steel session:', error);
      }
      this.steelSession = null;
    }
  }

  public getBrowser(): Browser | null {
    return this.browser;
  }

  public getSteelSession(): SteelSession | null {
    return this.steelSession;
  }
}

export const browserService = BrowserService.getInstance();
