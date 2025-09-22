#!/usr/bin/env node
/*
  Simple diagnostic: open a URL and capture screenshots.
  Usage:
    CANVAS_URL=http://35.224.11.43:3000 \
    GATEWAY_HEALTH=https://mcp-gateway-232368778929.us-central1.run.app/healthz \
    node scripts/diagnostics/snapshot-canvas.cjs
*/
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const CANVAS_URL = process.env.CANVAS_URL || 'http://35.224.11.43:3000';
  const GATEWAY_HEALTH = process.env.GATEWAY_HEALTH || 'https://mcp-gateway-232368778929.us-central1.run.app/healthz';
  const outDir = path.join('docs', 'screenshots');
  fs.mkdirSync(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  page.on('console', msg => console.log('[console]', msg.type(), msg.text()));
  page.on('requestfailed', req => console.warn('[requestfailed]', req.url(), req.failure()?.errorText));
  page.on('pageerror', err => console.error('[pageerror]', err?.message || err));

  const outMain = path.join(outDir, `canvas-${ts}.png`);
  const outHealth = path.join(outDir, `health-${ts}.png`);

  try {
    console.log('[open]', CANVAS_URL);
    const resp = await page.goto(CANVAS_URL, { waitUntil: 'load', timeout: 30000 });
    console.log('[status]', resp?.status());
    await page.waitForTimeout(1500);
    await page.screenshot({ path: outMain, fullPage: true });
    console.log('[saved]', outMain);
  } catch (e) {
    console.error('[error] main page', e?.message || e);
  }

  try {
    console.log('[open]', GATEWAY_HEALTH);
    await page.goto(GATEWAY_HEALTH, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: outHealth, fullPage: true });
    console.log('[saved]', outHealth);
  } catch (e) {
    console.warn('[warn] health check screenshot failed:', e?.message || e);
  }

  await browser.close();
})();

