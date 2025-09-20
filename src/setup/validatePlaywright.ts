import { chromium } from 'playwright';

function parseArgs(): string[] {
  return (process.env.BROWSER_ARGS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  console.log('\n🔍 Playwright Validation');

  const headless = process.env.INTERACTIVE === '0' || process.env.HEADLESS_BROWSER === 'true';
  const executablePath = process.env.BROWSER_EXECUTABLE_PATH || chromium.executablePath?.();

  if (executablePath) {
    console.log('• Chromium executable:', executablePath);
  } else {
    console.log('• Using bundled Chromium from Playwright.');
  }

  const browser = await chromium.launch({
    executablePath: process.env.BROWSER_EXECUTABLE_PATH,
    headless,
    args: parseArgs(),
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('about:blank');
  console.log('✅ Launched Chromium and opened a page.');
  await browser.close();
  console.log('✅ Validation complete.');
}

main().catch((e) => {
  console.error('❌ Validation failed:', e);
  process.exit(1);
});
