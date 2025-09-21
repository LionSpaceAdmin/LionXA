// scripts/verifyBrowser.ts
import { chromium } from 'playwright';

async function verifyBrowser() {
  console.log('🚀 Verifying browser service...');
  const browser = await chromium.launch();
  try {
    console.log('✅ Browser initialized.');

    const page = await browser.newPage();
    console.log('✅ Page created.');

    await page.goto('https://www.google.com');
    console.log('✅ Navigated to Google.');

    await page.screenshot({ path: 'google-verification.png' });
    console.log('✅ Screenshot taken and saved as google-verification.png.');

    console.log('🎉 Browser verification successful!');
  } catch (error) {
    console.error('❌ Browser verification failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
    console.log('✅ Browser closed.');
  }
}

verifyBrowser();