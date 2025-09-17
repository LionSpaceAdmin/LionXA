"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BotMessageSquare, AlertTriangle, Info, Loader } from 'lucide-react';
import { getAgentStatus } from '@/app/actions';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '../ui/skeleton';

export function LiveActivityFeed() {
  const t = useTranslations('LiveActivityFeed');

  const { data, isLoading, isError, error } = useQuery({
      queryKey: ['agent-logs'],
      queryFn: getAgentStatus,
      refetchInterval: 3000, // Refresh logs every 3 seconds
  });

  const logs = data?.logs?.slice().reverse() || [];

  const getIcon = (line: string) => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('error') || lowerLine.includes('failed')) return <AlertTriangle className="h-5 w-5 text-red-500" />;
      if (lowerLine.includes('reply') || lowerLine.includes('posted')) return <BotMessageSquare className="h-5 w-5 text-blue-500" />;
      return <Info className="h-5 w-5 text-gray-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px] rounded-md border p-4 font-mono text-xs">
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          )}
          {isError && (
              <div className="flex items-center text-red-500">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  <p>{t('errorLoading')}: {error.message}</p>
              </div>
          )}
          {logs.length === 0 && !isLoading && (
            <div className="flex h-full items-center justify-center text-center text-muted-foreground">
              <p>{t('noActivity')}</p>
            </div>
          )}
          {logs.map((log, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-0.5">{getIcon(log)}</div>
              <p className="flex-1">{log}</p>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
