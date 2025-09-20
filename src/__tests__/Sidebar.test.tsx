import { render, screen } from '@testing-library/react';
import Sidebar from '@/components/dashboard/Sidebar';
import React from 'react';

// Mock next/link to a simple passthrough for tests
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Sidebar Component', () => {
  const realToLocale = Date.prototype.toLocaleTimeString;

  beforeAll(() => {
    // Ensure deterministic time formatting across environments
    jest.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('12:34:56' as unknown as string);
  });

  afterAll(() => {
    Date.prototype.toLocaleTimeString = realToLocale;
  });

  it('renders recent events with formatted text and time', () => {
    type DashboardEvent = { timestamp: string; event: string; data: { username?: string; content?: string; error?: string } };
    const events: DashboardEvent[] = [
      {
        timestamp: '2023-01-01T12:34:56Z',
        event: 'tweet_processed',
        data: { username: 'user1' },
      },
      {
        timestamp: '2023-01-01T12:35:56Z',
        event: 'gemini_call',
        data: {},
      },
    ];

    render(<Sidebar isConnected={true} recentEvents={events} />);

    // Header/link area
    expect(screen.getByText('פעילות')).toBeInTheDocument();

    // Event texts derived by formatEventText
    expect(screen.getByText('עיבוד ציוץ מ-@user1')).toBeInTheDocument();
    expect(screen.getByText('קריאה ל-Gemini...')).toBeInTheDocument();

    // Formatted time from mocked toLocaleTimeString
    expect(screen.getAllByText('12:34:56')[0]).toBeInTheDocument();
  });
});
