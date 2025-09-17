import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2 } from 'lucide-react';

export function VisualEditor() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Share2 className="h-6 w-6 text-primary" />
          <CardTitle className="font-headline text-lg">Flow Editor</CardTitle>
        </div>
        <CardDescription>
          Visualize and manage your agent's workflow.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">Visual Editor Canvas (Coming Soon)</p>
        </div>
      </CardContent>
    </Card>
  );
}
