import {
  BotMessageSquare,
  BarChart,
  DollarSign,
  Clock,
} from 'lucide-react';
import type { Metric, AgentStatus, LatencyData } from './types';

export const agentStatus: AgentStatus = 'active';
export const agentUptime = '99.98%';
export const activeProfile = 'Default Profile';

export const metrics: Metric[] = [
  {
    id: '1',
    title: 'Responses Today',
    value: '1,204',
    change: 5.2,
    icon: BotMessageSquare,
  },
  {
    id: '2',
    title: 'Engagement Rate',
    value: '65.8%',
    change: -1.1,
    icon: BarChart,
  },
  {
    id: '3',
    title: 'Est. Cost (24h)',
    value: '$12.53',
    change: 2.5,
    icon: DollarSign,
  },
  {
    id: '4',
    title: 'Avg. Response Time',
    value: '1.2s',
    change: -8.0,
    icon: Clock,
  },
];

export const latencyData: LatencyData[] = [
  { time: '12:00', latency: 1100 },
  { time: '12:05', latency: 1300 },
  { time: '12:10', latency: 1050 },
  { time: '12:15', latency: 1400 },
  { time: '12:20', latency: 1200 },
  { time: '12:25', latency: 1150 },
  { time: '12:30', latency: 1250 },
];
