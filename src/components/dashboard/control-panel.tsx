import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Power, ShieldAlert } from 'lucide-react';

export function ControlPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Control Panel</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row">
        <Button variant="destructive" className="w-full">
          <ShieldAlert className="mr-2 h-4 w-4" /> Emergency Stop
        </Button>
        <Button variant="outline" className="w-full">
          <Power className="mr-2 h-4 w-4" /> Pause/Resume Agent
        </Button>
      </CardContent>
    </Card>
  );
}
