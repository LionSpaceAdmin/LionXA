import { spawn, type ChildProcess } from 'child_process';
import path from 'path';

type AgentStatus = 'offline' | 'running' | 'error';

class AgentManager {
    private static instance: AgentManager;
    private agentProcess: ChildProcess | null = null;
    private status: AgentStatus = 'offline';
    private logs: string[] = [];
    private readonly MAX_LOGS = 100;

    private constructor() {
        this.addLog('AgentManager initialized.');
    }

    public static getInstance(): AgentManager {
        if (!AgentManager.instance) {
            AgentManager.instance = new AgentManager();
        }
        return AgentManager.instance;
    }

    private addLog(message: string) {
        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp}: ${message}`;
        this.logs.push(logEntry);
        if (this.logs.length > this.MAX_LOGS) {
            this.logs.shift();
        }
        console.log(`[AgentManager] ${message}`);
    }

    public getStatus(): AgentStatus {
        return this.status;
    }

    public getLogs(): string[] {
        return this.logs;
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.agentProcess) {
                this.addLog('Agent is already running.');
                return reject(new Error('Agent is already running.'));
            }

            this.addLog('Starting agent process with ts-node...');
            const agentScriptPath = path.resolve(process.cwd(), 'src/agent/watchList.ts');
            this.addLog(`Agent script path: ${agentScriptPath}`);

            const tsNodePath = path.resolve(process.cwd(), 'node_modules/.bin/ts-node');

            this.agentProcess = spawn(tsNodePath, [agentScriptPath], {
                stdio: ['pipe', 'pipe', 'pipe'],
                cwd: process.cwd(),
                env: { ...process.env, NODE_ENV: 'development' },
            });

            this.status = 'running';

            this.agentProcess.stdout?.on('data', (data: Buffer) => {
                this.addLog(`[Agent STDOUT] ${data.toString().trim()}`);
            });

            this.agentProcess.stderr?.on('data', (data: Buffer) => {
                const errorMessage = data.toString().trim();
                this.addLog(`[Agent STDERR] ${errorMessage}`);
            });

            this.agentProcess.on('spawn', () => {
                this.addLog('Agent process spawned successfully.');
                resolve();
            });

            this.agentProcess.on('error', (err) => {
                this.addLog(`Failed to start agent process: ${err.message}`);
                this.status = 'error';
                this.agentProcess = null;
                reject(err);
            });

            this.agentProcess.on('exit', (code, signal) => {
                this.addLog(`Agent process exited with code ${code}, signal ${signal}.`);
                if (code !== 0 && signal !== 'SIGTERM') {
                    this.status = 'error';
                } else {
                    this.status = 'offline';
                }
                this.agentProcess = null;
            });
        });
    }

    public stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.agentProcess) {
                this.addLog('Agent is not running.');
                return reject(new Error('Agent is not running.'));
            }

            this.addLog('Stopping agent process...');
            this.agentProcess.kill('SIGTERM');
            // The 'exit' event handler will update the status and clean up.
            resolve();
        });
    }
}

// Export a singleton instance of the AgentManager
export const agentManager = AgentManager.getInstance();
