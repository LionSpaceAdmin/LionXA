import {
  BotMessageSquare,
  BarChart,
  DollarSign,
  Clock,
} from 'lucide-react';
import type { Metric, AgentStatus, Activity, LatencyData } from './types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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

export const activities: Activity[] = [
  {
    id: '1',
    type: 'tweet_response',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    description: 'Responded to tweet from @user1: "Great point!"',
    user: { name: 'user1', avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar-1')?.imageUrl || '' },
  },
  {
    id: '2',
    type: 'error',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    description: 'Failed to generate response. OpenAI API Error: Rate limit exceeded.',
  },
  {
    id: '3',
    type: 'system_event',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    description: 'Agent restarted successfully.',
  },
  {
    id: '4',
    type: 'tweet_response',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    description:
      'Responded to tweet from @user2: "I disagree, here is why..."',
    user: { name: 'user2', avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar-2')?.imageUrl || '' },
  },
    {
    id: '5',
    type: 'tweet_response',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    description:
      'Responded to tweet from @user3: "Interesting perspective, thanks for sharing!"',
    user: { name: 'user3', avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar-3')?.imageUrl || '' },
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
