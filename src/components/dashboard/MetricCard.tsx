'use client';
import React, { useRef, useEffect } from 'react';
import type { Chart as ChartJS, ChartConfiguration } from 'chart.js';

interface MetricCardProps {
  icon?: React.ReactNode;
  title: string;
  value?: string;
  change?: string;
  isChart?: boolean;
  isNetworkCanvas?: boolean;
  data?: EventData[];
  fullHeight?: boolean;
}

interface EventData {
  timestamp: string;
  event: string;
  username?: string;
  data?: {
    username?: string;
  };
}

export default function MetricCard({ icon, title, value, change, isChart = false, isNetworkCanvas = false, data = [], fullHeight = false }: MetricCardProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<ChartJS | null>(null);
  const networkCanvasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!(isChart && chartRef.current && data)) return;
      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }

      const { Chart, registerables } = await import('chart.js');
      if (cancelled) return;
      Chart.register(...registerables);

      const chartData = {
        labels: data.map(e => new Date(e.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })).reverse(),
        datasets: [
          {
            label: 'Replies',
            data: data.map(e => e.event === 'reply_posted' ? 1 : 0).reverse(),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            type: 'bar' as const,
            order: 2,
          },
          {
            label: 'Gemini Calls',
            data: data.map(e => e.event === 'gemini_call' ? 1 : 0).reverse(),
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            type: 'bar' as const,
            order: 2,
          },
           {
            label: 'Errors',
            data: data.map(e => e.event === 'error' ? 1 : 0).reverse(),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            type: 'bar' as const,
            order: 2,
          },
        ],
      };

      const config: ChartConfiguration = {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false },
          },
          scales: {
            x: {
              stacked: true,
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94a3b8' },
            },
            y: {
              stacked: true,
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94a3b8', stepSize: 1 },
              beginAtZero: true,
            },
          },
        },
      };

      chartInstance.current = new Chart(ctx, config);
    })();
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      cancelled = true;
    };
  }, [isChart, data]);

  useEffect(() => {
    if (isNetworkCanvas && networkCanvasRef.current && data?.length) {
      const event = data[0];
      if (event.data?.username) {
        const canvas = networkCanvasRef.current;
        if (!canvas) return;

        const node = document.createElement('div');
        node.className = 'network-node absolute w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold animate-pulse-short cursor-pointer transition-all duration-300 hover:scale-110 shadow-lg';
        node.textContent = event.data.username.substring(0, 2).toUpperCase();
        node.style.left = `${Math.random() * (canvas.offsetWidth - 40)}px`;
        node.style.top = `${Math.random() * (canvas.offsetHeight - 40)}px`;
        
        canvas.appendChild(node);
        
        setTimeout(() => {
            if (node.parentNode === canvas) {
                node.style.opacity = '0';
                node.style.transform = 'scale(0.5)';
                setTimeout(() => node.remove(), 500);
            }
        }, 4500);
      }
    }
  }, [isNetworkCanvas, data]);

  const cardClasses = `bg-card border rounded-xl shadow-sm flex flex-col ${fullHeight ? 'h-full' : ''}`;

  return (
    <div className={cardClasses}>
      <div className="p-4 flex items-center gap-4">
        {icon}
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <div className="flex-1 p-4 pt-0">
        {isChart ? (
          <div className="chart-container relative h-full min-h-[300px] rounded-lg bg-background/60">
            {(!data || data.length === 0) && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                אין פעילות להצגה
              </div>
            )}
            <canvas ref={chartRef} className="w-full h-full"></canvas>
          </div>
        ) : isNetworkCanvas ? (
          <div ref={networkCanvasRef} className="network-canvas h-full min-h-[300px] relative overflow-hidden rounded-lg bg-background/60">
            <style>{`.animate-pulse-short { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }`}</style>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="text-4xl font-bold">{value}</div>
            {change && <div className="text-xs text-muted-foreground mt-1">{change}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
