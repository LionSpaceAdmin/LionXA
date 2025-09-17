"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { getAgentStatus } from '@/app/actions';
import { agentUptime, activeProfile } from '@/app/lib/mock-data';
import type { AgentStatus as AgentStatusType } from '@/lib/types';


export function AgentStatusCard() {
  const [status, setStatus] = useState<AgentStatusType>('offline');

  useEffect(() => {
    const fetchStatus = async () => {
      const { status: newStatus } = await getAgentStatus();
      setStatus(newStatus);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const isRunning = status === 'running';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Agent Status</CardTitle>
        <CardDescription>Real-time operational status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <span className="text-sm font-medium">Status</span>
          <StatusBadge status={isRunning ? 'active' : status} pulse={isRunning} />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <span className="text-sm font-medium">Uptime (24h)</span>
          <span className="text-sm text-muted-foreground">{isRunning ? agentUptime : 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <span className="text-sm font-medium">Active Profile</span>
          <span className="text-sm text-muted-foreground">{activeProfile}</span>
        </div>
      </CardContent>
    </Card>
  );
}
