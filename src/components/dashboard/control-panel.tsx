"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Power, ShieldAlert, Play, Pause } from 'lucide-react';
import { getAgentStatus, startAgent, stopAgent } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { AgentStatus } from '@/lib/types';

export function ControlPanel() {
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
        title: result.success ? 'Success' : 'Error',
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
          title: 'Agent Not Running',
          description: 'Emergency stop is only available for a running agent.',
        });
        return;
      }
      const result = await stopAgent();
      toast({
        title: result.success ? 'Emergency Stop Activated' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      await fetchStatus();
    });
  };

  const isRunning = status === 'running';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Control Panel</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row">
        <Button variant="destructive" className="w-full" onClick={handleEmergencyStop} disabled={isPending || !isRunning}>
          <ShieldAlert className="mr-2 h-4 w-4" /> Emergency Stop
        </Button>
        <Button variant="outline" className="w-full" onClick={handleToggle} disabled={isPending}>
            {isRunning ? (
                <>
                    <Pause className="mr-2 h-4 w-4" /> Pause Agent
                </>
            ) : (
                <>
                    <Play className="mr-2 h-4 w-4" /> Start Agent
                </>
            )}
        </Button>
      </CardContent>
    </Card>
  );
}
