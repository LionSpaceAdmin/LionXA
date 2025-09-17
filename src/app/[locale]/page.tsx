
"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppHeader } from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import { AgentStatusCard } from '@/components/dashboard/agent-status-card';
import { ControlPanel } from '@/components/dashboard/control-panel';
import { LiveActivityFeed } from '@/components/dashboard/live-activity-feed';
import { AnalyticsDashboard } from '@/components/dashboard/analytics-dashboard';
import { AIOptimization } from '@/components/dashboard/ai-optimization';
import { VisualEditor } from '@/components/dashboard/visual-editor';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileDashboard } from '@/components/mobile/MobileDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { getAgentStatus } from '@/app/actions';

export default function Home() {
  const t = useTranslations('Dashboard');
  const isMobile = useIsMobile();
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  useEffect(() => {
    // Only poll for logs on desktop
    if (!isMobile) {
      const fetchLogs = async () => {
        try {
          const { logs: newLogs } = await getAgentStatus();
          setLogs(newLogs.slice().reverse());
        } catch (error) {
          console.error("Failed to fetch logs:", error);
        } finally {
          setIsLoadingLogs(false);
        }
      };

      fetchLogs();
      const interval = setInterval(fetchLogs, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isMobile]);


  if (isMobile === undefined) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (isMobile) {
    return (
        <SidebarProvider>
            <MobileDashboard />
        </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar
        variant="inset"
        collapsible="icon"
        className="hidden border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex"
      >
        <SidebarHeader className="p-4">
          <h1 className="font-headline text-2xl font-bold text-sidebar-primary">
            XAgent
          </h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="p-4 lg:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="col-span-1 lg:col-span-12">
              <h1 className="font-headline text-3xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground">
                {t('welcomeMessage')}
              </p>
            </div>

            <div className="col-span-1 grid gap-6 lg:col-span-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <ControlPanel />
                <AgentStatusCard />
              </div>

              <div className="col-span-1">
                <AnalyticsDashboard />
              </div>
              
              <div className="col-span-1 lg:col-span-1">
                <VisualEditor />
              </div>
            </div>

            <div className="col-span-1 lg:col-span-4">
              <LiveActivityFeed logs={logs} isLoading={isLoadingLogs} className="h-full" />
            </div>

            <div className="col-span-1 lg:col-span-12">
              <AIOptimization />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
