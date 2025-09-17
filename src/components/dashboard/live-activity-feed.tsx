
"use client";

import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal } from 'lucide-react';

interface LiveActivityFeedProps {
  logs: string[];
  title?: string;
  className?: string;
  isLoading?: boolean;
}

export function LiveActivityFeed({ logs, title = "Live Activity", className, isLoading = false }: LiveActivityFeedProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This could be enhanced to scroll to bottom, but for now we keep it simple.
  }, [logs]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="font-headline text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px]" ref={scrollAreaRef}>
          <div className="space-y-2 font-code text-xs text-muted-foreground">
            {isLoading ? (
              <div className="flex h-[400px] items-center justify-center text-center">
                <p>Loading logs...</p>
              </div>
            ) : logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Terminal className="mt-0.5 h-3 w-3 shrink-0" />
                  <p className="flex-1">{log}</p>
                </div>
              ))
            ) : (
              <div className="flex h-[400px] items-center justify-center text-center">
                <p>Waiting for agent activity...<br/>Press "Start Agent" to begin.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
