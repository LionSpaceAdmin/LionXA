"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useQuery } from '@tanstack/react-query';
import { getAgentStatus } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import type { AgentStatus } from '@/lib/types';

export function AgentStatusCard() {
  const t = useTranslations('AgentStatusCard');

  const { data, isLoading, isError } = useQuery<{ status: AgentStatus }>({
    queryKey: ['agent-status'],
    queryFn: getAgentStatus,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const status = data?.status || 'offline';
  const uptime = status === 'running' ? '99.98%' : t('notAvailable');
  const activeProfile = status === 'running' ? 'Default Profile' : t('notAvailable');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <span className="text-sm font-medium">{t('status')}</span>
          {isLoading ? <Skeleton className="h-6 w-20" /> : <StatusBadge status={isError ? 'error' : status} pulse={status === 'running'} />}
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <span className="text-sm font-medium">{t('uptime')}</span>
          {isLoading ? <Skeleton className="h-5 w-16" /> : <span className="text-sm text-muted-foreground">{uptime}</span>}
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <span className="text-sm font-medium">{t('activeProfile')}</span>
          {isLoading ? <Skeleton className="h-5 w-24" /> : <span className="text-sm text-muted-foreground">{activeProfile}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
