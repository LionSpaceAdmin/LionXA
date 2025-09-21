#!/usr/bin/env node
const { spawn } = require('node:child_process');

function run(cmd, args, name, extraEnv = {}) {
  const child = spawn(cmd, args, { stdio: 'inherit', shell: true, env: { ...process.env, ...extraEnv } });
  child.on('exit', (code, signal) => {
    console.log(`[${name}] exited with`, code ?? signal);
    process.exit(code === null ? 1 : code);
  });
  return child;
}

console.log('Starting production orchestrator (UI + Agent + Edge Proxy)...');
const children = [];

// Pick a non-default UI port to avoid collisions in dev shells
const UI_PORT = process.env.UI_PORT || '3000';
const WS_PORT = process.env.DASHBOARD_PORT || '3011';
children.push(run('pnpm', ['start'], 'ui', { PORT: UI_PORT }));
children.push(run('pnpm', ['start:agent:prod'], 'agent', { DASHBOARD_PORT: WS_PORT }));
children.push(run('node', ['scripts/edge-proxy.js'], 'edge', { UI_PORT, DASHBOARD_PORT: WS_PORT }));

const shutdown = () => {
  for (const c of children) {
    try { c.kill('SIGINT'); } catch {}
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);
