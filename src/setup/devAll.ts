/*
  Dev orchestrator: runs the main server which handles the UI and Agent.
  Usage:
    pnpm dev:all
*/

import { spawn } from "node:child_process";

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

console.log(`Starting unified dev server...`);

// Start the main server, which will handle Next.js and the agent
const serverProcess = run("ts-node", ["-O", "'{\\\"module\\\":\\\"commonjs\\\"}'", "src/server.ts"], "server");

// Cleanup on exit/signals
const shutdown = () => {
  try {
    serverProcess.kill("SIGINT");
  } catch {}
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("exit", shutdown);
