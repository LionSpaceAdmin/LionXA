"use client";

import { AppHeader } from "@/components/header";
import { AgentStatusCard } from "@/components/dashboard/agent-status-card";
import { ControlPanel } from "@/components/dashboard/control-panel";
import { LiveActivityFeed } from "@/components/dashboard/live-activity-feed";

export function MobileDashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex-1 space-y-4 p-4">
        <h1 className="font-headline text-2xl font-bold">Dashboard</h1>
        <div className="space-y-4">
            <ControlPanel />
            <AgentStatusCard />
            <LiveActivityFeed />
        </div>
      </main>
    </div>
  );
}
