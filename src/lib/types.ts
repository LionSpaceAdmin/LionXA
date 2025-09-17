import type { LucideIcon } from "lucide-react";

export type AgentStatus = "active" | "paused" | "error" | "offline" | "running";

export type Activity = {
  id: string;
  type: "tweet_response" | "error" | "system_event";
  timestamp: Date;
  description: string;
  user?: {
    name: string;
    avatarUrl: string;
  };
};

export type Metric = {
  id: string;
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
};

export type LatencyData = {
  time: string;
  latency: number;
};
