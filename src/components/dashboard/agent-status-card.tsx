"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { agentStatus, agentUptime, activeProfile } from '@/app/lib/mock-data';

export function AgentStatusCard() {
  const t = useTranslations('AgentStatusCard');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <span className="text-sm font-medium">{t('status')}</span>
          <StatusBadge status={agentStatus} pulse={agentStatus === 'active'} />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <span className="text-sm font-medium">{t('uptime')}</span>
          <span className="text-sm text-muted-foreground">{agentUptime}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <span className="text-sm font-medium">{t('activeProfile')}</span>
          <span className="text-sm text-muted-foreground">{activeProfile}</span>
        </div>
      </CardContent>
    </Card>
  );
}
