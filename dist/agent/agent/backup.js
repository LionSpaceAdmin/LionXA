"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBackupScheduler = startBackupScheduler;
exports.restoreFromLatestBackup = restoreFromLatestBackup;
// src/backup.ts
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const config_1 = require("./config");
async function ensureBackupDir() {
    await fs.mkdir(config_1.config.agent.security.backupPath, { recursive: true });
}
async function createBackup() {
    try {
        await ensureBackupDir();
        // Load current data
        let cookies = undefined;
        try {
            // Legacy cookies.json (optional). With persistent profile we no longer rely on this.
            const cookiesPath = path.resolve(__dirname, '../cookies.json');
            cookies = JSON.parse(await fs.readFile(cookiesPath, 'utf-8'));
        }
        catch { }
        const memory = JSON.parse(await fs.readFile(path.resolve(__dirname, '../memory.json'), 'utf-8'));
        const logs = JSON.parse(await fs.readFile(path.resolve(__dirname, '../handled_tweets.json'), 'utf-8'));
        const backup = {
            timestamp: new Date().toISOString(),
            cookies,
            memory,
            engagementLogs: logs
        };
        // Create backup with timestamp
        const backupPath = path.join(config_1.config.agent.security.backupPath, `backup_${backup.timestamp.replace(/[:.]/g, '-')}.json`);
        await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));
        console.log(`✅ Backup created at: ${backupPath}`);
        // Clean old backups (keep last 5)
        const files = await fs.readdir(config_1.config.agent.security.backupPath);
        const backups = files.filter(f => f.startsWith('backup_')).sort();
        if (backups.length > 5) {
            const toDelete = backups.slice(0, backups.length - 5);
            for (const file of toDelete) {
                await fs.unlink(path.join(config_1.config.agent.security.backupPath, file));
            }
        }
    }
    catch (error) {
        console.error('Failed to create backup:', error);
        throw error;
    }
}
async function startBackupScheduler() {
    const interval = config_1.config.agent.security.backupInterval;
    setInterval(createBackup, interval);
    console.log(`📦 Backup scheduler started (interval: ${interval / 1000 / 60} minutes)`);
    // Initial backup
    await createBackup();
}
async function restoreFromLatestBackup() {
    try {
        const files = await fs.readdir(config_1.config.agent.security.backupPath);
        const backups = files.filter(f => f.startsWith('backup_')).sort();
        if (backups.length === 0) {
            throw new Error('No backups found');
        }
        const latestBackup = backups[backups.length - 1];
        const backupData = JSON.parse(await fs.readFile(path.join(config_1.config.agent.security.backupPath, latestBackup), 'utf-8'));
        // Restore data (cookies.json is legacy/optional with persistent profile)
        if (backupData.cookies) {
            await fs.writeFile(path.resolve(__dirname, '../cookies.json'), JSON.stringify(backupData.cookies, null, 2));
        }
        await fs.writeFile(path.resolve(__dirname, '../memory.json'), JSON.stringify(backupData.memory, null, 2));
        await fs.writeFile(path.resolve(__dirname, '../handled_tweets.json'), JSON.stringify(backupData.engagementLogs, null, 2));
        console.log(`✅ Restored from backup: ${latestBackup}`);
    }
    catch (error) {
        console.error('Failed to restore from backup:', error);
        throw error;
    }
}
