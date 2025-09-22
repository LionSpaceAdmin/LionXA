
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, Settings, CircleHelp } from "lucide-react";

interface DashboardEvent {
  timestamp: string;
  event: string;
  data: {
    username?: string;
    content?: string;
    error?: string;
  };
}

interface SidebarProps {
  isConnected: boolean;
  recentEvents: DashboardEvent[];
}

interface FormattedEvent extends DashboardEvent {
  formattedTime: string;
}

const getEventStyling = (eventType: string) => {
  switch (eventType) {
    case "tweet_processed":
      return { icon: "🔍", color: "text-blue-400" };
    case "reply_posted":
      return { icon: "✅", color: "text-green-400" };
    case "error":
      return { icon: "❌", color: "text-red-400" };
    case "gemini_call":
      return { icon: "✨", color: "text-purple-400" };
    default:
      return { icon: "🔹", color: "text-gray-400" };
  }
};

const formatEventText = (event: DashboardEvent) => {
  switch (event.event) {
    case "tweet_processed":
      return `עיבוד ציוץ מ-@${event.data.username}`;
    case "reply_posted":
      return `תגובה נשלחה ל-@${event.data.username}`;
    case "error":
      return `שגיאה: ${event.data.error?.substring(0, 40)}...`;
    case "gemini_call":
      return `קריאה ל-Gemini...`;
    default:
      return `אירוע לא ידוע: ${event.event}`;
  }
};

export default function Sidebar({ recentEvents }: SidebarProps) {
  const [formattedEvents, setFormattedEvents] = useState<FormattedEvent[]>([]);

  useEffect(() => {
    // This effect runs only on the client, preventing hydration mismatch.
    const clientSideFormattedEvents = recentEvents.map((event) => ({
      ...event,
      formattedTime: new Date(event.timestamp).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    }));
    setFormattedEvents(clientSideFormattedEvents);
  }, [recentEvents]);

  return (
    <aside className="hidden w-80 flex-col border-l border-border bg-card sm:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Activity className="h-6 w-6" />
          <span>פעילות</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <ul className="grid gap-3 px-4 text-sm font-medium">
          {formattedEvents.map((event, index) => {
            const { icon, color } = getEventStyling(event.event);
            return (
              <li
                key={index}
                className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full bg-muted ${color}`}
                >
                  {icon}
                </span>
                <div className="grid gap-1">
                  <p className="font-semibold text-foreground">
                    {formatEventText(event)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.formattedTime}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="mt-auto border-t p-4">
        <nav className="grid gap-2 text-sm font-medium">
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <Settings className="h-4 w-4" />
            הגדרות
          </a>
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <CircleHelp className="h-4 w-4" />
            תמיכה
          </a>
        </nav>
      </div>
    </aside>
  );
}
