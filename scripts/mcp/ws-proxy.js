#!/usr/bin/env node
const WebSocket = require('ws');

function parseArg(name, def) {
  const flag = process.argv.find(a => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!flag) return def;
  if (flag.includes('=')) return flag.split('=')[1];
  const i = process.argv.indexOf(flag);
  return process.argv[i + 1] || def;
}

const server = parseArg('server', 'filesystem');
const base = process.env.MCP_GATEWAY_URL || 'ws://localhost:8080';
const authToken = process.env.MCP_AUTH_TOKEN || '';
const idToken = process.env.MCP_ID_TOKEN || '';

const qp = new URLSearchParams({ server });
// Always include custom token in query param if present (works with Cloud Run auth too)
if (authToken) qp.set('token', authToken);
const url = `${base.replace(/\/$/, '')}/ws?${qp.toString()}`;

const headers = {};
// If a Cloud Run identity token is provided, send it in Authorization to satisfy run.invoker
if (idToken) headers['Authorization'] = `Bearer ${idToken}`;
// If no ID token is set, fall back to sending the custom token in Authorization header
else if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

const ws = new WebSocket(url, { perMessageDeflate: false, headers });

ws.on('open', () => {
  // pipe stdin -> ws
  process.stdin.on('data', chunk => {
    try { ws.send(chunk); } catch (_) {}
  });
});
ws.on('message', (data) => {
  try { process.stdout.write(data); } catch (_) {}
});
ws.on('close', (code, reason) => {
  process.stderr.write(`\n[ws-proxy] closed ${code} ${reason}\n`);
  process.exit(0);
});
ws.on('error', (err) => {
  process.stderr.write(`[ws-proxy] error: ${err?.message || err}\n`);
  process.exit(1);
});
