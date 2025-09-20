/*
  Dev orchestrator: runs Next.js UI and dashboard/agent concurrently.
  Usage:
    pnpm dev:mock   -> UI + mock feed (dashboard on :3001)
    pnpm dev:agent  -> UI + agent (dashboard started by agent on :3001)
    pnpm dev:dash   -> UI + only dashboard
*/

import { spawn } from 'node:child_process';

type Mode = 'mock' | 'agent' | 'dash';

const mode: Mode = (process.argv[2] as Mode) || 'mock';

function run(cmd: string, args: string[], name: string) {
  const child = spawn(cmd, args, { stdio: 'inherit', shell: true, env: process.env });
  child.on('exit', (code, signal) => {
    console.log(`[${name}] exited with`, code ?? signal);
    process.exit(code === null ? 1 : code);
  });
  return child;
}

console.log(`Starting dev orchestrator (mode: ${mode})...`);

const children: ReturnType<typeof run>[] = [];

// Start Next.js dev UI
children.push(run('pnpm', ['dev'], 'ui'));

// Start the data source
if (mode === 'agent') {
  // Agent already starts the dashboard internally
  children.push(run('pnpm', ['start:agent'], 'agent'));
} else if (mode === 'dash') {
  children.push(run('pnpm', ['dashboard'], 'dashboard'));
} else {
  // Default: mock feed (starts dashboard and pushes fake events)
  children.push(run('pnpm', ['start:mock'], 'mock'));
}

// Cleanup on exit/signals
const shutdown = () => {
  for (const c of children) {
    try { c.kill('SIGINT'); } catch {}
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);

