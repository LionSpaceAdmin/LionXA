import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { activities } from '@/app/lib/mock-data';
import { BotMessageSquare, AlertTriangle, Cog } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Activity } from '@/app/lib/types';

const iconMap = {
  tweet_response: BotMessageSquare,
  error: AlertTriangle,
  system_event: Cog,
};

const colorMap = {
    tweet_response: "text-primary",
    error: "text-destructive",
    system_event: "text-muted-foreground"
}

export function LiveActivityFeed() {

  const renderIcon = (activity: Activity) => {
    const Icon = iconMap[activity.type];
    if(activity.type === 'tweet_response' && activity.user) {
        return (
            <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user.avatarUrl} alt={activity.user.name} data-ai-hint="person face" />
                <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
        )
    }
    return (
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-secondary", colorMap[activity.type])}>
            <Icon className="h-4 w-4" />
        </div>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline text-lg">Live Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px]">
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                {renderIcon(activity)}
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
