"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Power, ShieldAlert, Play, Pause, Bell } from 'lucide-react';
import { getAgentStatus, startAgent, stopAgent, sendTestNotification } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { AgentStatus } from '@/lib/types';

export function ControlPanel() {
  const t = useTranslations('ControlPanel');
  const { toast } = useToast();
  const [status, setStatus] = useState<AgentStatus>('offline');
  const [isPending, startTransition] = useTransition();

  const fetchStatus = async () => {
    const { status: newStatus } = await getAgentStatus();
    setStatus(newStatus);
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    startTransition(async () => {
      const isRunning = status === 'running';
      const action = isRunning ? stopAgent : startAgent;
      const result = await action();
      toast({
        title: result.success ? t('notifications.success') : t('notifications.error'),
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      await fetchStatus(); // Immediately refetch status after action
    });
  };
  
  const handleEmergencyStop = () => {
    startTransition(async () => {
      if (status !== 'running') {
        toast({
          title: t('notifications.agentNotRunning'),
          description: t('notifications.agentNotRunningDesc'),
        });
        return;
      }
      const result = await stopAgent();
      toast({
        title: result.success ? t('notifications.emergencyStopActivated') : t('notifications.error'),
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      await fetchStatus();
    });
  };

  const handleSendNotification = () => {
    startTransition(async () => {
      const result = await sendTestNotification();
       toast({
        title: result.success ? t('notifications.notificationSent') : t('notifications.notificationFailed'),
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    });
  };

  const isRunning = status === 'running';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Button variant="destructive" className="w-full" onClick={handleEmergencyStop} disabled={isPending || !isRunning}>
          <ShieldAlert className="mr-2 h-4 w-4" /> {t('emergencyStop')}
        </Button>
        <Button variant="outline" className="w-full" onClick={handleToggle} disabled={isPending}>
            {isRunning ? (
                <>
                    <Pause className="mr-2 h-4 w-4" /> {t('pauseAgent')}
                </>
            ) : (
                <>
                    <Play className="mr-2 h-4 w-4" /> {t('startAgent')}
                </>
            )}
        </Button>
        <Button variant="secondary" className="w-full" onClick={handleSendNotification} disabled={isPending}>
          <Bell className="mr-2 h-4 w-4" /> {t('sendTestNotification')}
        </Button>
      </CardContent>
    </Card>
  );
}
