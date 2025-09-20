import { render, screen } from '@testing-library/react';
import Sidebar from '@/components/dashboard/Sidebar';

// Mock next/link to a simple passthrough for tests
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

describe('Sidebar Component', () => {
  const realToLocale = Date.prototype.toLocaleTimeString;

  beforeAll(() => {
    // Ensure deterministic time formatting across environments
    jest.spyOn(Date.prototype as any, 'toLocaleTimeString').mockReturnValue('12:34:56');
  });

  afterAll(() => {
    Date.prototype.toLocaleTimeString = realToLocale;
  });

  it('renders recent events with formatted text and time', () => {
    const events = [
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

    render(<Sidebar isConnected={true} recentEvents={events as any} />);

    // Header/link area
    expect(screen.getByText('פעילות')).toBeInTheDocument();

    // Event texts derived by formatEventText
    expect(screen.getByText('עיבוד ציוץ מ-@user1')).toBeInTheDocument();
    expect(screen.getByText('קריאה ל-Gemini...')).toBeInTheDocument();

    // Formatted time from mocked toLocaleTimeString
    expect(screen.getAllByText('12:34:56')[0]).toBeInTheDocument();
  });
});

