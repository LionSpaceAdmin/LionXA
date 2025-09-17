"use client";

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Power, ShieldAlert, Play, StopCircle } from 'lucide-react';
import { startAgent, stopAgent } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useTransition } from 'react';

export function ControlPanel() {
  const t = useTranslations('ControlPanel');
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleStart = () => {
    startTransition(async () => {
      const result = await startAgent();
      toast({
        title: result.success ? t('notifications.startSuccessTitle') : t('notifications.startErrorTitle'),
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    });
  };

  const handleStop = () => {
    startTransition(async () => {
      const result = await stopAgent();
      toast({
        title: result.success ? t('notifications.stopSuccessTitle') : t('notifications.stopErrorTitle'),
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Button variant="secondary" onClick={handleStart} disabled={isPending}>
          <Play className="mr-2 h-4 w-4" /> {t('startAgent')}
        </Button>
        <Button variant="destructive" onClick={handleStop} disabled={isPending}>
          <StopCircle className="mr-2 h-4 w-4" /> {t('stopAgent')}
        </Button>
      </CardContent>
    </Card>
  );
}
