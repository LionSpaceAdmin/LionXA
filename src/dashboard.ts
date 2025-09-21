// src/dashboard.ts - Real-time XAgent Dashboard
import { Server } from "socket.io";
import { io, Socket } from "socket.io-client";
import { EventEmitter } from "events";
import browserService from "./browser";

export interface DashboardMetrics {
  timestamp: Date;
  event:
    | "tweet_processed"
    | "reply_posted"
    | "error"
    | "session_init"
    | "gemini_call"
    | "page_console"
    | "exception"
    | "backup_error"
    | "browser_crash"
    | "agent_log";
  data: {
    username?: string;
    content?: string;
    success?: boolean;
    error?: string;
    model?: string;
    responseTime?: number;
    level?: "log" | "info" | "warn" | "error" | "debug";
  };
}

class XAgentDashboard {
  private io: Server | null = null;
  private agentSocket: Socket | null = null;

  private metrics: DashboardMetrics[] = [];
  private activeConnections = 0;
  private startTime = new Date();
  private lastScreencap: { image: string; url?: string; ts: number } | null =
    null;
  private controlState = { paused: false, screencapMs: 3000 };

  constructor() {
    // Routes and server are now managed externally
  }

  public initAsAgentClient(serverUrl = "http://localhost:3000"): void {
    if (this.agentSocket) return;
    this.agentSocket = io(serverUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });
    this.agentSocket.on("connect", () => {
      console.log("📈 Agent connected to dashboard server");
    });
    this.agentSocket.on("disconnect", () => {
      console.log("📉 Agent disconnected from dashboard server");
    });
  }

  public start(io: Server): void {
    this.io = io;
    this.io.on("connection", (socket) => {
      this.activeConnections++;
      console.log(
        `📊 Dashboard client connected (${this.activeConnections} active)`,
      );

      // Send initial data
      socket.emit("initial-data", {
        uptime: Date.now() - this.startTime.getTime(),
        totalEvents: this.metrics.length,
        recentEvents: this.metrics.slice(-20),
        paused: this.controlState.paused,
        screencapMs: this.controlState.screencapMs,
      });

      // Send last screencap on connect to warm the UI
      if (this.lastScreencap) {
        socket.emit("screencap", this.lastScreencap);
      }

      socket.on("disconnect", () => {
        this.activeConnections--;
        console.log(
          `📊 Dashboard client disconnected (${this.activeConnections} active)`,
        );
      });

      // Basic interactive control events (best-effort)
      socket.on(
        "browser-click",
        async (payload: {
          x: number;
          y: number;
          button?: "left" | "right" | "middle";
        }) => {
          try {
            const page = await browserService.getPage();
            if (!page) return;
            const vp = page.viewportSize();
            if (!vp) return;
            const px = Math.max(
              0,
              Math.min(vp.width - 1, Math.round(payload.x * vp.width)),
            );
            const py = Math.max(
              0,
              Math.min(vp.height - 1, Math.round(payload.y * vp.height)),
            );
            await page.bringToFront().catch(() => {});
            await page.mouse.click(px, py, {
              button: payload.button || "left",
            });
          } catch {}
        },
      );

      socket.on("browser-type", async (payload: { text: string }) => {
        try {
          const page = await browserService.getPage();
          if (!page) return;
          await page.keyboard.type(payload.text, { delay: 20 });
        } catch {}
      });

      socket.on("browser-keypress", async (payload: { key: string }) => {
        try {
          const page = await browserService.getPage();
          if (!page) return;
          await page.bringToFront().catch(() => {});
          await page.keyboard.press(payload.key);
        } catch {}
      });

      socket.on("browser-wheel", async (payload: { deltaY: number }) => {
        try {
          const page = await browserService.getPage();
          if (!page) return;
          const dy = Math.max(
            -2000,
            Math.min(2000, Math.round(payload.deltaY)),
          );
          await page.mouse.wheel(0, dy);
        } catch {}
      });

      // Agent controls
      socket.on("agent-pause", (payload: { paused: boolean }) => {
        const prev = this.controlState.paused;
        this.controlState.paused = !!payload?.paused;
        control.emit("pause", this.controlState.paused);
        if (prev !== this.controlState.paused) {
          logAgentLog(
            `Agent ${this.controlState.paused ? "paused" : "resumed"}`,
          );
        }
        socket.emit("status", {
          paused: this.controlState.paused,
          screencapMs: this.controlState.screencapMs,
        });
      });
      socket.on("agent-reset", async () => {
        control.emit("reset");
        try {
          await browserService.close();
          await browserService.initialize();
        } catch {}
        logAgentLog("Agent session reset requested");
      });
      socket.on("get-status", () => {
        socket.emit("status", {
          paused: this.controlState.paused,
          screencapMs: this.controlState.screencapMs,
        });
      });
      socket.on("set-screencap-interval", (payload: { ms: number }) => {
        const v = Number(payload?.ms);
        if (!Number.isFinite(v)) return;
        const clamped = Math.max(500, Math.min(15000, Math.round(v)));
        this.controlState.screencapMs = clamped;
        control.emit("screencapMs", clamped);
        logAgentLog(`Screencap interval set to ${clamped}ms`);
        socket.emit("status", {
          paused: this.controlState.paused,
          screencapMs: this.controlState.screencapMs,
        });
      });

      socket.on(
        "submit-credentials",
        (payload: { user: string; pass: string }) => {
          if (
            payload &&
            typeof payload.user === "string" &&
            typeof payload.pass === "string"
          ) {
            control.emit("credentials", payload);
            logAgentLog(`Credentials submitted for user: ${payload.user}`);
          }
        },
      );
    });
  }

  public logEvent(event: DashboardMetrics) {
    // If running as server, store and broadcast
    if (this.io) {
      this.metrics.push(event);
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }
      this.io.emit("new-event", event);
    }
    // If running as agent client, just send to server
    else if (this.agentSocket) {
      this.agentSocket.emit("agent:event", event);
    }

    // Console log for debugging in both modes
    console.log(
      `📊 [${event.event}] ${event.data.username || "System"}: ${event.data.content || event.data.error || "Event logged"}`,
    );
  }

  // Broadcast a live browser image to all clients
  public broadcastScreencap(payload: {
    image: string;
    url?: string;
    ts?: number;
  }) {
    const msg = {
      image: payload.image,
      url: payload.url,
      ts: payload.ts ?? Date.now(),
    };

    // If running as server, store and broadcast
    if (this.io) {
      this.lastScreencap = msg;
      this.io.emit("screencap", msg);
    }
    // If running as agent client, just send to server
    else if (this.agentSocket) {
      this.agentSocket.emit("agent:screencap", msg);
    }
  }

  public getStats() {
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;

    const recentEvents = this.metrics.filter(
      (m) => m.timestamp.getTime() > hourAgo,
    );
    const repliesPosted = recentEvents.filter(
      (m) => m.event === "reply_posted" && m.data.success,
    ).length;
    const errors = recentEvents.filter((m) => m.event === "error").length;
    const geminiCalls = recentEvents.filter(
      (m) => m.event === "gemini_call",
    ).length;

    return {
      uptime: now - this.startTime.getTime(),
      totalEvents: this.metrics.length,
      lastHour: {
        repliesPosted,
        errors,
        geminiCalls,
        successRate:
          geminiCalls > 0
            ? ((repliesPosted / geminiCalls) * 100).toFixed(1) + "%"
            : "N/A",
      },
    };
  }
}

// Singleton instance
export const dashboard = new XAgentDashboard();
export const control = new EventEmitter();

// Helper functions for easy integration
export function logTweetProcessed(username: string, content: string) {
  dashboard.logEvent({
    timestamp: new Date(),
    event: "tweet_processed",
    data: { username, content: content.substring(0, 100) + "..." },
  });
}

export function logReplyPosted(
  username: string,
  reply: string,
  success: boolean,
) {
  dashboard.logEvent({
    timestamp: new Date(),
    event: "reply_posted",
    data: { username, content: reply, success },
  });
}

export function logGeminiCall(
  model: string,
  responseTime: number,
  success: boolean,
) {
  dashboard.logEvent({
    timestamp: new Date(),
    event: "gemini_call",
    data: { model, responseTime, success },
  });
}

export function logError(error: string, username?: string) {
  dashboard.logEvent({
    timestamp: new Date(),
    event: "error",
    data: { error, username },
  });
}

export function logSessionInit() {
  dashboard.logEvent({
    timestamp: new Date(),
    event: "session_init",
    data: {},
  });
}

// Helper to send a screencap from the agent/browser
export function sendScreencap(base64DataUrl: string, url?: string) {
  dashboard.broadcastScreencap({ image: base64DataUrl, url });
}

export function logPageConsole(
  level: "log" | "info" | "warn" | "error" | "debug",
  content: string,
) {
  dashboard.logEvent({
    timestamp: new Date(),
    event: "page_console",
    data: { level, content },
  });
}

export function logException(error: string) {
  dashboard.logEvent({
    timestamp: new Date(),
    event: "exception",
    data: { error },
  });
}

export function logAgentLog(
  content: string,
  level: "log" | "info" | "warn" | "error" | "debug" = "info",
) {
  dashboard.logEvent({
    timestamp: new Date(),
    event: "agent_log",
    data: { content, level },
  });
}
