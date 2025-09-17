
"use client";

import React from 'react';
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

export default function Home() {
  const t = useTranslations('Dashboard');

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
            </div>

            <div className="col-span-1 lg:col-span-4">
              <LiveActivityFeed />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
