"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { metrics, latencyData } from '@/app/lib/mock-data';
import { MetricCard } from './metric-card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { useMemo } from 'react';

const chartConfig = {
  latency: {
    label: 'Latency (ms)',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

export function AnalyticsDashboard() {
  const motion = useMemo(() => {
    try {
      return require("framer-motion").motion;
    } catch (e) {
      return (props) => <div {...props} />;
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Smart Analytics</CardTitle>
        <CardDescription>Key performance metrics and trends</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <MetricCard metric={metric} />
            </motion.div>
          ))}
        </div>
        <div>
          <h3 className="text-md mb-2 font-medium">Response Latency (ms)</h3>
          <div className="h-[200px]">
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={latencyData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value}
                />
                 <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <defs>
                    <linearGradient id="fillLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-latency)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-latency)" stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <Area
                  dataKey="latency"
                  type="natural"
                  fill="url(#fillLatency)"
                  stroke="var(--color-latency)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
