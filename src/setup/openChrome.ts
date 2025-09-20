import http from 'http';
import { ensureSession } from '../browser';
import { config } from '../config';

async function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function fetchCDPVersion(port: number): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: '127.0.0.1', port, path: '/json/version', timeout: 2000 }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const url = 'chrome://version';
  console.log('🚀 Opening Chrome session…');
  const { page } = await ensureSession(url);
  console.log('✅ Session up. URL:', page.url());
  if (config.browser.debugPort) {
    // give the browser a moment to open the port
    await wait(1000);
    try {
      const ver = await fetchCDPVersion(config.browser.debugPort);
      console.log('🔌 CDP /json/version:', ver);
    } catch (e) {
      console.warn('⚠️ Could not reach CDP endpoint on port', config.browser.debugPort, e);
    }
  }
  console.log('ℹ️ Keeping browser open for 60s…');
  await wait(60000);
}

main().catch((e) => {
  console.error('Failed to open Chrome:', e);
  process.exit(1);
});

