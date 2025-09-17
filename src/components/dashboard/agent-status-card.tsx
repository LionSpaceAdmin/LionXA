import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { agentStatus, agentUptime, activeProfile } from '@/app/lib/mock-data';

export function AgentStatusCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Agent Status</CardTitle>
        <CardDescription>Real-time operational status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <span className="text-sm font-medium">Status</span>
          <StatusBadge status={agentStatus} pulse />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <span className="text-sm font-medium">Uptime (24h)</span>
          <span className="text-sm text-muted-foreground">{agentUptime}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <span className="text-sm font-medium">Active Profile</span>
          <span className="text-sm text-muted-foreground">{activeProfile}</span>
        </div>
      </CardContent>
    </Card>
  );
}
