// src/dashboard.ts - Real-time XAgent Dashboard
import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';

export interface DashboardMetrics {
  timestamp: Date;
  event: 'tweet_processed' | 'reply_posted' | 'error' | 'session_init' | 'gemini_call';
  data: {
    username?: string;
    content?: string;
    success?: boolean;
    error?: string;
    model?: string;
    responseTime?: number;
  };
}

class XAgentDashboard {
  private app = express();
  private server = createServer(this.app);
  private io = new Server(this.server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  
  private metrics: DashboardMetrics[] = [];
  private activeConnections = 0;
  private startTime = new Date();

  constructor(private port: number = 3001) {
    this.setupRoutes();
    this.setupSocketIO();
  }

  private setupRoutes() {
    // Serve static dashboard files
    this.app.use(express.static(path.join(__dirname, '../dashboard-ui')));
    
    // API endpoints
    this.app.get('/api/metrics', (req, res) => {
      res.json({
        totalEvents: this.metrics.length,
        uptime: Date.now() - this.startTime.getTime(),
        activeConnections: this.activeConnections,
        recentEvents: this.metrics.slice(-50)
      });
    });

    // Main dashboard page
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../dashboard-ui/index.html'));
    });
  }

  private setupSocketIO() {
    this.io.on('connection', (socket) => {
      this.activeConnections++;
      console.log(`📊 Dashboard client connected (${this.activeConnections} active)`);
      
      // Send initial data
      socket.emit('initial-data', {
        uptime: Date.now() - this.startTime.getTime(),
        totalEvents: this.metrics.length,
        recentEvents: this.metrics.slice(-20)
      });

      socket.on('disconnect', () => {
        this.activeConnections--;
        console.log(`📊 Dashboard client disconnected (${this.activeConnections} active)`);
      });
    });
  }

  // Public method to log events from XAgent
  public logEvent(event: DashboardMetrics) {
    this.metrics.push(event);
    
    // Keep only last 1000 events in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Broadcast to all connected clients
    this.io.emit('new-event', event);
    
    // Console log for debugging
    console.log(`📊 [${event.event}] ${event.data.username || 'System'}: ${event.data.content || event.data.error || 'Event logged'}`);
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`📊 XAgent Dashboard running at http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  public getStats() {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    const recentEvents = this.metrics.filter(m => m.timestamp.getTime() > hourAgo);
    const repliesPosted = recentEvents.filter(m => m.event === 'reply_posted' && m.data.success).length;
    const errors = recentEvents.filter(m => m.event === 'error').length;
    const geminiCalls = recentEvents.filter(m => m.event === 'gemini_call').length;

    return {
      uptime: now - this.startTime.getTime(),
      totalEvents: this.metrics.length,
      lastHour: {
        repliesPosted,
        errors,
        geminiCalls,
        successRate: geminiCalls > 0 ? (repliesPosted / geminiCalls * 100).toFixed(1) + '%' : 'N/A'
      }
    };
  }
}

// Singleton instance
export const dashboard = new XAgentDashboard();

// Helper functions for easy integration
export function logTweetProcessed(username: string, content: string) {
  dashboard.logEvent({
    timestamp: new Date(),
    event: 'tweet_processed',
    data: { username, content: content.substring(0, 100) + '...' }
  });
}

export function logReplyPosted(username: string, reply: string, success: boolean) {
  dashboard.logEvent({
    timestamp: new Date(),
    event: 'reply_posted',
    data: { username, content: reply, success }
  });
}

export function logGeminiCall(model: string, responseTime: number, success: boolean) {
  dashboard.logEvent({
    timestamp: new Date(),
    event: 'gemini_call',
    data: { model, responseTime, success }
  });
}

export function logError(error: string, username?: string) {
  dashboard.logEvent({
    timestamp: new Date(),
    event: 'error',
    data: { error, username }
  });
}

export function logSessionInit() {
  dashboard.logEvent({
    timestamp: new Date(),
    event: 'session_init',
    data: {}
  });
}
