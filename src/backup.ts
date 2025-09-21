// src/backup.ts
import * as fs from "fs/promises";
import * as path from "path";
import { config } from "./config";

interface BackupData {
  timestamp: string;
  cookies?: Record<string, unknown>[]; // optional with persistent profile
  memory: string[];
  engagementLogs: Record<string, unknown>[];
}

async function ensureBackupDir(): Promise<void> {
  await fs.mkdir(config.agent.security.backupPath, { recursive: true });
}

async function createBackup(): Promise<void> {
  try {
    await ensureBackupDir();

    // Load current data
    let cookies: Record<string, unknown>[] | undefined = undefined;
    try {
      // Legacy cookies.json (optional). With persistent profile we no longer rely on this.
      cookies = JSON.parse(await fs.readFile(config.data.cookies, "utf-8"));
    } catch {}
    let memory: string[] = [];
    try {
      memory = JSON.parse(await fs.readFile(config.data.memory, "utf-8"));
    } catch {
      memory = [];
    }
    let logs: Record<string, unknown>[] = [];
    try {
      logs = JSON.parse(await fs.readFile(config.data.handledTweets, "utf-8"));
    } catch {
      logs = [];
    }

    const backup: BackupData = {
      timestamp: new Date().toISOString(),
      cookies,
      memory,
      engagementLogs: logs,
    };

    // Create backup with timestamp
    const backupPath = path.join(
      config.agent.security.backupPath,
      `backup_${backup.timestamp.replace(/[:.]/g, "-")}.json`,
    );

    await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));
    console.log(`✅ Backup created at: ${backupPath}`);

    // Clean old backups (keep last 5)
    const files = await fs.readdir(config.agent.security.backupPath);
    const backups = files.filter((f) => f.startsWith("backup_")).sort();

    if (backups.length > 5) {
      const toDelete = backups.slice(0, backups.length - 5);
      for (const file of toDelete) {
        await fs.unlink(path.join(config.agent.security.backupPath, file));
      }
    }
  } catch (error) {
    console.error("Failed to create backup:", error);
    // Do not crash the agent if backup fails; log and continue
  }
}

export async function startBackupScheduler(): Promise<void> {
  const interval = config.agent.security.backupInterval;
  setInterval(createBackup, interval);
  console.log(
    `📦 Backup scheduler started (interval: ${interval / 1000 / 60} minutes)`,
  );

  // Initial backup
  await createBackup();
}

export async function restoreFromLatestBackup(): Promise<void> {
  try {
    const files = await fs.readdir(config.agent.security.backupPath);
    const backups = files.filter((f) => f.startsWith("backup_")).sort();

    if (backups.length === 0) {
      throw new Error("No backups found");
    }

    const latestBackup = backups[backups.length - 1];
    const backupData: BackupData = JSON.parse(
      await fs.readFile(
        path.join(config.agent.security.backupPath, latestBackup),
        "utf-8",
      ),
    );

    // Restore data (cookies.json is legacy/optional with persistent profile)
    if (backupData.cookies) {
      await fs.writeFile(
        config.data.cookies,
        JSON.stringify(backupData.cookies, null, 2),
      );
    }
    await fs.writeFile(
      config.data.memory,
      JSON.stringify(backupData.memory, null, 2),
    );
    await fs.writeFile(
      config.data.handledTweets,
      JSON.stringify(backupData.engagementLogs, null, 2),
    );

    console.log(`✅ Restored from backup: ${latestBackup}`);
  } catch (error) {
    console.error("Failed to restore from backup:", error);
    throw error;
  }
}
