// src/lib/agent-manager.ts
'use server';

import { spawn, ChildProcess } from 'child_process';
import path from 'path';

interface AgentState {
  process: ChildProcess | null;
  status: 'offline' | 'running' | 'error';
  logs: string[];
}

// In-memory state store. In a real multi-server environment, this would need to be a shared store like Redis.
const agentState: AgentState = {
  process: null,
  status: 'offline',
  logs: [],
};

const MAX_LOG_LINES = 100;

function addToLogs(data: string) {  
  const lines = data.split('\n').filter(line => line.trim() !== '');
  agentState.logs.push(...lines);
  if (agentState.logs.length > MAX_LOG_LINES) {
    agentState.logs.splice(0, agentState.logs.length - MAX_LOG_LINES);
  }
}

export function startAgentProcess(): { success: boolean; message: string } {
  if (agentState.process) {
    return { success: false, message: 'Agent is already running.' };
  }

  addToLogs('Starting agent process...');

  // The agent script is now in `dist/agent/watchList.js` after building.
  const scriptPath = path.resolve(process.cwd(), 'dist/agent/watchList.js');
  const agentProcess = spawn('node', [scriptPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    // The CWD should be the project root so the agent can find its own files
    cwd: process.cwd(), 
  });

  agentState.process = agentProcess;
  agentState.status = 'running';

  agentProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[Agent STDOUT]: ${output}`);
    addToLogs(output);
  });

  agentProcess.stderr.on('data', (data) => {
    const errorOutput = data.toString();
    console.error(`[Agent STDERR]: ${errorOutput}`);
    addToLogs(`ERROR: ${errorOutput}`);
    agentState.status = 'error';
  });

  agentProcess.on('close', (code) => {
    console.log(`Agent process exited with code ${code}`);
    addToLogs(`Agent process stopped. Exit code: ${code}`);
    agentState.process = null;
    agentState.status = 'offline';
  });

   agentProcess.on('error', (err) => {
    console.error('Failed to start agent process:', err);
    addToLogs(`FATAL: Failed to start agent process: ${err.message}`);
    agentState.process = null;
    agentState.status = 'error';
  });

  addToLogs(`Agent process started with PID: ${agentProcess.pid}`);
  return { success: true, message: `Agent process started with PID: ${agentProcess.pid}` };
}

export function stopAgentProcess(): { success: boolean; message: string } {
  if (!agentState.process) {
    return { success: false, message: 'Agent is not running.' };
  }

  addToLogs('Stopping agent process...');
  const killed = agentState.process.kill('SIGTERM'); // Send termination signal

  if (killed) {
    return { success: true, message: 'Agent stop signal sent.' };
  } else {
    return { success: false, message: 'Failed to send stop signal to agent.' };
  }
}

export function getAgentState(): { status: 'offline' | 'running' | 'error'; logs: string[] } {
    // If the process is null, ensure status is offline.
    if(agentState.process === null && agentState.status === 'running') {
        agentState.status = 'offline';
    }
    return {
        status: agentState.status,
        logs: agentState.logs,
    };
}
