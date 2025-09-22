"use client";
import { Bot, Wifi, WifiOff } from "lucide-react";

interface HeaderProps {
  uptime: number;
  isConnected: boolean;
}

const formatUptime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function Header({ uptime, isConnected }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center border-b bg-card px-6">
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">XAgent Control</span>
      </div>
      <nav className="mr-6">
        <ul className="flex gap-4 text-sm text-neutral-300">
          <li><a href="/" className="hover:text-white">דשבורד</a></li>
          <li><a href="/health" className="hover:text-white">בריאות פרויקט</a></li>
          <li><a href="/vision" className="hover:text-white">חזון</a></li>
          <li><a href="/tools" className="hover:text-white">כלים</a></li>
        </ul>
      </nav>
      <div className="mr-auto flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isConnected ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          <span>{isConnected ? "מחובר" : "מנותק"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>זמן פעולה:</span>
          <span className="font-mono text-primary">{formatUptime(uptime)}</span>
        </div>
      </div>
    </header>
  );
}
