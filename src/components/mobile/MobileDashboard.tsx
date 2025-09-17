
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { AppHeader } from "@/components/header";
import { AgentStatusCard } from "@/components/dashboard/agent-status-card";
import { ControlPanel } from "@/components/dashboard/control-panel";
import { LiveActivityFeed } from "@/components/dashboard/live-activity-feed";
import { getAgentStatus } from '@/app/actions';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';

export function MobileDashboard() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchLogs = () => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const { logs: newLogs } = await getAgentStatus();
        setLogs(newLogs.slice().reverse().slice(0, 50)); // Show latest 50 logs
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex-1 space-y-4 p-4">
        <div className='flex justify-between items-center'>
            <h1 className="font-headline text-2xl font-bold">Dashboard</h1>
            <Button size="sm" variant="outline" onClick={fetchLogs} disabled={isLoading || isPending}>
                <RefreshCw className={`h-4 w-4 ${isLoading || isPending ? 'animate-spin' : ''}`} />
                <span className="ml-2">Refresh</span>
            </Button>
        </div>
        <div className="space-y-4">
            <ControlPanel />
            <AgentStatusCard />
            <LiveActivityFeed logs={logs} isLoading={isLoading || isPending} />
        </div>
      </main>
    </div>
  );
}
