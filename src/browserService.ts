// src/browserService.ts
import { chromium, firefox, webkit, Browser, Page, BrowserType } from 'playwright';
import { config } from './config';

type BrowserName = 'chromium' | 'firefox' | 'webkit';

class BrowserService {
  private browser: Browser | null = null;
  private static instance: BrowserService;

  private constructor() {}

  public static getInstance(): BrowserService {
    if (!BrowserService.instance) {
      BrowserService.instance = new BrowserService();
    }
    return BrowserService.instance;
  }

  public async initialize(browserType: BrowserName = 'chromium'): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

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
  }

  public getBrowser(): Browser | null {
    return this.browser;
  }
}

export const browserService = BrowserService.getInstance();
