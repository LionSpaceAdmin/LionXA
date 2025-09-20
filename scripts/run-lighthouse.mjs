#!/usr/bin/env node
/**
 * Build + start Next.js in production, then run Lighthouse and save reports.
 *
 * Usage:
 *   node scripts/run-lighthouse.mjs [--url http://localhost:3000] [--preset desktop|mobile]
 *   Environment:
 *     CHROME_PATH  Optional absolute path to Chrome/Chromium binary
 */
import { spawn } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

// Parse CLI args: supports --key=value and --key value
const argv = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const token = process.argv[i];
  if (!token?.startsWith('--')) continue;
  const eq = token.indexOf('=');
  if (eq !== -1) {
    const key = token.slice(2, eq);
    const val = token.slice(eq + 1);
    argv.set(key, val);
  } else {
    const key = token.slice(2);
    const next = process.argv[i + 1];
    if (next && !next.startsWith('--')) {
      argv.set(key, next);
      i += 1;
    } else {
      argv.set(key, true);
    }
  }
}

const url = (argv.get('url') || 'http://localhost:3000/').toString();
const preset = (argv.get('preset') || 'desktop').toString();
const chromePath = process.env.CHROME_PATH || '';

const reportsDir = path.join(process.cwd(), 'reports', 'lighthouse');

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const ps = spawn(cmd, args, { stdio: 'inherit', shell: false, ...opts });
    ps.on('error', reject);
    ps.on('exit', (code) => (code === 0 ? resolve(undefined) : reject(new Error(`${cmd} ${args.join(' ')} exited with ${code}`))));
  });
}

async function waitForUrl(targetUrl, timeoutMs = 60_000) {
  const started = Date.now();
  // Node 18+ has global fetch
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(targetUrl, { method: 'GET' });
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for ${targetUrl}`);
}

async function main() {
  // Ensure reports dir exists
  if (!existsSync(reportsDir)) {
    await mkdir(reportsDir, { recursive: true });
  }

  // Always build to ensure production assets
  await run('pnpm', ['build']);

  // If server not up, start it
  let serverStarted = false;
  let serverExited = false;
  try {
    await waitForUrl(url, 2_000);
  } catch {
    const server = spawn('pnpm', ['start', '-p', new URL(url).port || '3000'], { stdio: 'inherit' });
    serverStarted = true;
    server.on('exit', () => { serverExited = true; });
    await waitForUrl(url, 90_000);
  }

  try {

    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const outBase = path.join(reportsDir, `lighthouse-${preset}-${ts}`);
    const lighthouseArgs = [
      url,
      `--preset=${preset}`,
      '--output=json',
      '--output=html',
      `--output-path=${outBase}.report`,
      '--chrome-flags=--headless=new',
    ];
    if (chromePath) {
      lighthouseArgs.push(`--chrome-path=${chromePath}`);
    }

    // Prefer local install if available; otherwise npx
    const cmd = 'pnpm';
    const args = ['exec', 'lighthouse', ...lighthouseArgs];
    await run(cmd, args);

    console.log(`\n✅ Lighthouse reports saved to: ${outBase}.{html,json}\n`);
  } finally {
    if (serverStarted && !serverExited) {
      // best-effort shutdown
      try { process.kill(-1, 'SIGINT'); } catch {}
    }
  }
}

main().catch((err) => {
  console.error('Lighthouse run failed:', err?.message || err);
  process.exit(1);
});
