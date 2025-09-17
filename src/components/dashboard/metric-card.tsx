import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Metric } from '@/app/lib/types';
import { ArrowUp, ArrowDown } from 'lucide-react';

export function MetricCard({ metric }: { metric: Metric }) {
  const isPositive = metric.change >= 0;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
        <metric.icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric.value}</div>
        <p
          className={cn(
            'text-xs text-muted-foreground flex items-center',
            isPositive ? 'text-green-600' : 'text-red-600'
          )}
        >
          {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
          {Math.abs(metric.change)}% from last 24h
        </p>
      </CardContent>
    </Card>
  );
}
