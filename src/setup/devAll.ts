/*
  Dev orchestrator: runs Next.js UI and the real Agent concurrently.
  Usage:
    pnpm dev -> UI + agent (dashboard started by agent on :3001)
*/

import { spawn } from "node:child_process";

const mode = "agent" as const;

function run(cmd: string, args: string[], name: string) {
  const child = spawn(cmd, args, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  child.on("exit", (code, signal) => {
    console.log(`[${name}] exited with`, code ?? signal);
    process.exit(code === null ? 1 : code);
  });
  return child;
}

console.log(`Starting dev orchestrator (mode: ${mode})...`);

const children: ReturnType<typeof run>[] = [];

// Start Next.js dev UI (do not recurse via pnpm dev)
children.push(run("next", ["dev"], "ui"));

// Start the data source
// Start the real agent (which starts the dashboard internally)
children.push(run("pnpm", ["start:agent:prod"], "agent"));

// Cleanup on exit/signals
const shutdown = () => {
  for (const c of children) {
    try {
      c.kill("SIGINT");
    } catch {}
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("exit", shutdown);
