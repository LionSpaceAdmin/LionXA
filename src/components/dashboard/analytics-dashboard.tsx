"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { metrics, latencyData } from '@/app/lib/mock-data';
import { MetricCard } from './metric-card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

export function AnalyticsDashboard() {
  const t = useTranslations('Analytics');

  const chartConfig = {
    latency: {
      label: 'Latency',
      color: 'hsl(var(--accent))',
    },
  } satisfies ChartConfig;

  const translatedMetrics = useMemo(() => [
    { ...metrics[0], title: t('metrics.avgResponseTime') },
    { ...metrics[1], title: t('metrics.engagementRate') },
    { ...metrics[2], title: t('metrics.tweetsPerDay') },
    { ...metrics[3], title: t('metrics.errorRate') },
  ], [t]);

  const motion = useMemo(() => {
    try {
      return require("framer-motion").motion;
    } catch (e) {
      // Return a div if framer-motion is not available
      return (props: any) => <div {...props} />;
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {translatedMetrics.map((metric, i) => (
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
          <h3 className="text-md mb-2 font-medium">{t('responseLatency')}</h3>
          <div className="h-[200px]">
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={latencyData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 5)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="latency"
                  type="natural"
                  fill="var(--color-latency)"
                  fillOpacity={0.4}
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
