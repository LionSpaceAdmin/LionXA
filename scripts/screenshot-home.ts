import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  const url = process.env.SCREENSHOT_URL || 'http://localhost:3000';
  const outDir = process.env.SCREENSHOT_DIR || 'reports';
  const outPath = path.join(outDir, process.env.SCREENSHOT_FILE || 'screenshot-home.png');
  const channel = process.env.BROWSER_CHANNEL || 'chromium';

  fs.mkdirSync(outDir, { recursive: true });

  console.log('📸 Taking screenshot of', url, '→', outPath, '(channel:', channel, ')');
  const ctx = await chromium.launchPersistentContext(path.resolve('.playwright-tmp-profile'), {
    headless: true,
    channel,
    viewport: { width: 1366, height: 900 },
    args: [
      '--disable-crash-reporter',
      '--no-sandbox',
      '--disable-dev-shm-usage',
    ],
  });
  const page = await ctx.newPage();

  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (!resp || !resp.ok()) {
      console.warn('⚠️ Navigation response not OK:', resp?.status(), resp?.statusText());
    }
    await page.waitForTimeout(1000);
    await page.screenshot({ path: outPath, fullPage: true });
    console.log('✅ Saved:', outPath);
  } finally {
    await ctx.close();
  }
}

main().catch((e) => {
  console.error('❌ Screenshot failed:', e);
  process.exit(1);
});
