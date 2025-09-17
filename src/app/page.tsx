"use client";

import React from 'react';
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

export default function Home() {
  const isMobile = useIsMobile();

  if (isMobile === undefined) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (isMobile) {
    return <MobileDashboard />;
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
              <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome to your AI Agent Management Platform.
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
              <LiveActivityFeed />
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
