"use client";
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

declare global {
  interface Window {
    liveSocket?: Socket;
  }
}
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import MetricCard from '@/components/dashboard/MetricCard';
import { Activity, Bot, MessageCircle, Zap, Target, Network } from 'lucide-react';

interface DashboardEvent {
  timestamp: string;
  event: 'tweet_processed' | 'reply_posted' | 'error' | 'session_init' | 'gemini_call' | 'page_console' | 'exception' | 'backup_error' | 'browser_crash' | 'agent_log';
  data: {
    username?: string;
    content?: string;
    success?: boolean;
    error?: string;
    model?: string;
    responseTime?: number;
    level?: 'log' | 'info' | 'warn' | 'error' | 'debug';
  };
}

export default function Home() {
  const [, setSocket] = useState<Socket | null>(null);
  const [uptime, setUptime] = useState(0);
  const [recentEvents, setRecentEvents] = useState<DashboardEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [screencap, setScreencap] = useState<{ image: string; url?: string; ts: number } | null>(null);
  const [diagEvents, setDiagEvents] = useState<DashboardEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [screencapMs, setScreencapMs] = useState(3000);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const needsLogin = screencap?.url?.includes('login');

  function handleCredsSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sock = window.liveSocket;
    if (sock && sock.connected && user && pass) {
      sock.emit('submit-credentials', { user, pass });
    }
  }


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
    window.liveSocket = newSocket;

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

    newSocket.on('initial-data', (data: { uptime: number; totalEvents: number; recentEvents: DashboardEvent[]; paused?: boolean; screencapMs?: number }) => {
      console.log('Received initial-data:', data);
      setUptime(data.uptime || 0);
      setRecentEvents(data.recentEvents || []);
      setIsPaused(!!data.paused);
      if (typeof data.screencapMs === 'number') setScreencapMs(data.screencapMs);
      setDiagEvents((data.recentEvents || []).filter((e) => e.event === 'error' || e.event === 'exception' || e.event === 'page_console'));
    });

    newSocket.on('new-event', (event: DashboardEvent) => {
      console.log('Received new-event:', event);
      setRecentEvents(prevEvents => [event, ...prevEvents.slice(0, 49)]);
      if (event.event === 'error' || event.event === 'exception' || event.event === 'page_console') {
        setDiagEvents((prev) => [event, ...prev.slice(0, 99)]);
      }
    });

    newSocket.on('screencap', (payload: { image: string; url?: string; ts: number }) => {
      setScreencap(payload);
    });

    const uptimeInterval = setInterval(() => {
        if (newSocket.connected) {
            newSocket.emit('get-uptime');
            newSocket.emit('get-status');
        }
    }, 1000);


    return () => {
      newSocket.disconnect();
      clearInterval(uptimeInterval);
    };
  }, []);

  function handleViewerClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    // Forward click into the live browser via Socket.IO using normalized coords
    const container = imgRef.current;
    if (!container || !screencap) return;
    const rect = container.getBoundingClientRect();
    // account for letterboxing when using object-contain
    const imgAspect = container.naturalWidth && container.naturalHeight
      ? container.naturalWidth / container.naturalHeight
      : rect.width / rect.height;
    const boxAspect = rect.width / rect.height;
    let drawWidth = rect.width;
    let drawHeight = rect.height;
    let offsetX = 0;
    let offsetY = 0;
    if (imgAspect > boxAspect) {
      // image is wider than box
      drawWidth = rect.width;
      drawHeight = rect.width / imgAspect;
      offsetY = (rect.height - drawHeight) / 2;
    } else {
      // image is taller than box
      drawHeight = rect.height;
      drawWidth = rect.height * imgAspect;
      offsetX = (rect.width - drawWidth) / 2;
    }
    const x = (e.clientX - rect.left - offsetX) / drawWidth;
    const y = (e.clientY - rect.top - offsetY) / drawHeight;
    if (x < 0 || y < 0 || x > 1 || y > 1) return; // outside image content
    // emit
    const sock = window.liveSocket;
    if (sock && sock.connected) {
      sock.emit('browser-click', { x, y, button: 'left' });
    }
  }

  function handleViewerKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const sock = window.liveSocket;
    if (!sock || !sock.connected) return;
    // Avoid default browser shortcuts interfering
    const printable = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
    if (printable) {
      sock.emit('browser-type', { text: e.key });
      e.preventDefault();
      return;
    }
    // Forward special keys
    const passKeys = new Set([
      'Enter','Backspace','Tab','Escape','Delete','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End','PageUp','PageDown'
    ]);
    if (passKeys.has(e.key)) {
      sock.emit('browser-keypress', { key: e.key });
      e.preventDefault();
    }
  }

  function handleViewerWheel(e: React.WheelEvent<HTMLDivElement>) {
    const sock = window.liveSocket;
    if (!sock || !sock.connected) return;
    sock.emit('browser-wheel', { deltaY: e.deltaY });
    e.preventDefault();
  }

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

  function togglePause() {
    const next = !isPaused;
    setIsPaused(next);
    const sock = window.liveSocket;
    if (sock && sock.connected) sock.emit('agent-pause', { paused: next });
  }
  function resetSession() {
    const sock = window.liveSocket;
    if (sock && sock.connected) sock.emit('agent-reset');
  }

  function applyScreencapMs(newMs: number) {
    const ms = Math.max(500, Math.min(15000, Math.round(newMs)));
    setScreencapMs(ms);
    const sock = window.liveSocket;
    if (sock && sock.connected) sock.emit('set-screencap-interval', { ms });
  }

  useEffect(() => {
    const sock = window.liveSocket;
    if (!sock) return;
    const onStatus = (s: { paused?: boolean; screencapMs?: number }) => {
      if (typeof s.paused === 'boolean') setIsPaused(s.paused);
      if (typeof s.screencapMs === 'number') setScreencapMs(s.screencapMs);
    };
    sock.on('status', onStatus);
    return () => { sock.off('status', onStatus); };
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden" dir="rtl">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header uptime={uptime} isConnected={isConnected} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto w-full">
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

          {/* Live Browser View */}
          <div className="mt-8">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
                <div className="text-sm text-neutral-300">
                  דפדפן חי{screencap?.url ? ` — ${screencap.url}` : ''}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={togglePause} className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">
                    {isPaused ? 'המשך' : 'השהה סוכן'}
                  </button>
                  <button onClick={resetSession} className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">
                    אפס סשן
                  </button>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-neutral-400">קצב:</span>
                    <select value={screencapMs} onChange={(e) => applyScreencapMs(parseInt(e.target.value))} className="bg-neutral-800 border border-neutral-700 rounded px-1 py-0.5 text-neutral-200">
                      <option value={1000}>1s</option>
                      <option value={3000}>3s</option>
                      <option value={5000}>5s</option>
                      <option value={8000}>8s</option>
                      <option value={10000}>10s</option>
                    </select>
                  </div>
                  {isPaused && <span className="text-amber-400 text-xs border border-amber-500/40 rounded px-2 py-0.5">מושהה</span>}
                  <div className="text-xs text-neutral-500">{screencap ? new Date(screencap.ts).toLocaleTimeString() : '—'}</div>
                </div>
              </div>
              <div
                className="aspect-video bg-black flex items-center justify-center outline-none relative"
                onClick={handleViewerClick}
                onKeyDown={handleViewerKeyDown}
                onWheel={handleViewerWheel}
                tabIndex={0}
              >
                {screencap?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img ref={imgRef} src={screencap.image} alt="Live browser" className="w-full h-full object-contain select-none" draggable={false} />
                ) : (
                  <div className="text-neutral-500 text-sm">אין תצוגה חיה — הפעל סוכן כדי לראות תמונה</div>
                )}
                {needsLogin && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <form onSubmit={handleCredsSubmit} className="p-6 rounded-lg border border-neutral-700 bg-neutral-800/80 flex flex-col gap-3 text-sm">
                      <div className="font-semibold">נדרשת התחברות</div>
                      <input type="text" value={user} onChange={e => setUser(e.target.value)} placeholder="שם משתמש או אימייל" className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5" />
                      <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="סיסמה" className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5" />
                      <button type="submit" className="bg-blue-600 hover:bg-blue-700 rounded px-3 py-1.5 text-white font-semibold">התחבר</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Diagnostics Panel */}
          <div className="mt-8">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
                <div className="text-sm text-neutral-300">חלון דיאגנוסטיקה</div>
                <div className="text-xs text-neutral-500">מציג שגיאות ולוגים מהדפדפן והסוכן</div>
              </div>
              <div className="max-h-80 overflow-y-auto text-sm">
                {diagEvents.length === 0 ? (
                  <div className="p-4 text-neutral-500">אין הודעות כרגע</div>
                ) : (
                  diagEvents.map((ev: DashboardEvent, idx: number) => {
                    const ts = new Date(ev.timestamp).toLocaleTimeString();
                    const level = ev.data.level || (ev.event === 'error' || ev.event === 'exception' ? 'error' : 'info');
                    const color = level === 'error' ? 'text-red-400' : level === 'warn' ? 'text-yellow-400' : 'text-neutral-300';
                    const msg = ev.data.error || ev.data.content || ev.event;
                    return (
                      <div key={idx} className="px-4 py-2 border-b border-neutral-800">
                        <span className="text-xs text-neutral-500 ml-2">{ts}</span>
                        <span className={`text-xs mr-2 ${color}`}>[{level}]</span>
                        <span className="text-neutral-200 break-words">{msg}</span>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex justify-end p-2 border-t border-neutral-800">
                <button onClick={() => setDiagEvents([])} className="text-xs px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700">נקה דיאגנוסטיקה</button>
              </div>
            </div>
          </div>
          </div>
        </main>
      </div>

      {/* Sidebar */}
      <Sidebar isConnected={isConnected} recentEvents={recentEvents} />
    </div>
  );
}
