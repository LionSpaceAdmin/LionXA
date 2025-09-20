"use client";
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import MetricCard from '@/components/dashboard/MetricCard';
import { Activity, Bot, MessageCircle, Zap, Target, Network } from 'lucide-react';

interface DashboardEvent {
  timestamp: string;
  event: 'tweet_processed' | 'reply_posted' | 'error' | 'session_init' | 'gemini_call';
  data: {
    username?: string;
    content?: string;
    success?: boolean;
    error?: string;
    model?: string;
    responseTime?: number;
  };
}

export default function Home() {
  const [, setSocket] = useState<Socket | null>(null);
  const [uptime, setUptime] = useState(0);
  const [recentEvents, setRecentEvents] = useState<DashboardEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Flexible Socket.IO URL to avoid hard-coded localhost and reduce breakage
    const envUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL;
    const envPort = process.env.NEXT_PUBLIC_DASHBOARD_PORT || '3001';
    const envPath = process.env.NEXT_PUBLIC_DASHBOARD_PATH || '/socket.io';

    let socketUrl: string | undefined = undefined;
    if (envUrl) {
      socketUrl = envUrl;
    } else if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1' || /^(192|10|172)\./.test(host)) {
        socketUrl = `${window.location.protocol}//${host}:${envPort}`;
      } else {
        socketUrl = undefined; // same-origin if proxied
      }
    }

    const newSocket = io(socketUrl, {
      path: envPath,
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      withCredentials: false,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket.IO connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.warn('Socket.IO connect_error:', err?.message || err);
    });

    newSocket.on('initial-data', (data) => {
      console.log('Received initial-data:', data);
      setUptime(data.uptime || 0);
      setRecentEvents(data.recentEvents || []);
    });

    newSocket.on('new-event', (event: DashboardEvent) => {
      console.log('Received new-event:', event);
      setRecentEvents(prevEvents => [event, ...prevEvents.slice(0, 49)]);
    });

    const uptimeInterval = setInterval(() => {
        if (newSocket.connected) {
            newSocket.emit('get-uptime');
        }
    }, 1000);


    return () => {
      newSocket.disconnect();
      clearInterval(uptimeInterval);
    };
  }, []);

  const getMetricValue = (event: 'reply_posted' | 'gemini_call', condition: (e: DashboardEvent) => boolean) => {
      return recentEvents.filter(e => e.event === event && condition(e)).length;
  }

  const repliesCount = getMetricValue('reply_posted', (e) => e.data.success === true);
  const geminiCalls = getMetricValue('gemini_call', () => true);
  const successRate = geminiCalls > 0 ? ((repliesCount / geminiCalls) * 100).toFixed(0) : 0;

  const averageResponseTime =
  geminiCalls > 0
    ? (
        recentEvents
          .filter((e) => e.event === 'gemini_call' && e.data.responseTime)
          .reduce((acc, e) => acc + (e.data.responseTime || 0), 0) /
        geminiCalls /
        1000
      ).toFixed(1) + 's'
    : 'N/A';

  return (
    <div className="flex h-screen w-full overflow-hidden" dir="rtl">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header uptime={uptime} isConnected={isConnected} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={<MessageCircle size={28} className="text-primary" />}
              title="תגובות היום"
              value={repliesCount.toString()}
              change="+12% מאתמול"
            />
            <MetricCard
              icon={<Zap size={28} className="text-purple-400" />}
              title="קריאות Gemini"
              value={geminiCalls.toString()}
              change={`ממוצע: ${averageResponseTime}`}
            />
            <MetricCard
              icon={<Target size={28} className="text-green-400" />}
              title="שיעור הצלחה"
              value={`${successRate}%`}
              change="יציב"
            />
            <MetricCard
              icon={<Bot size={28} className="text-orange-400" />}
              title="סך הכל סשנים"
              value={recentEvents.length.toString()}
              change="פעילות אחרונה"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <MetricCard
                icon={<Activity size={20} />}
                title="גרף פעילות"
                isChart={true}
                data={recentEvents}
                fullHeight={true}
              />
            </div>
            <div className="lg:col-span-1">
              <MetricCard
                icon={<Network size={20} />}
                title="מפת רשת חיה"
                isNetworkCanvas={true}
                data={recentEvents}
                fullHeight={true}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Sidebar */}
      <Sidebar isConnected={isConnected} recentEvents={recentEvents} />
    </div>
  );
}
