
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAgentStatus } from '@/app/actions';
import { Terminal } from 'lucide-react';

export function LiveActivityFeed() {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      const { logs: newLogs } = await getAgentStatus();
      setLogs(newLogs.slice().reverse()); // Reverse to show newest first
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline text-lg">Live Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px]" ref={scrollAreaRef}>
          <div className="space-y-2 font-code text-xs text-muted-foreground">
            {logs.length > 0 ? (
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

