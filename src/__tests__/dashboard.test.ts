// Mock dependencies
jest.mock('express', () => ({
  __esModule: true,
  default: () => ({
    use: jest.fn(),
    get: jest.fn(),
    listen: jest.fn(),
  }),
}));

jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
  })),
}));

jest.mock('../logging');

import { dashboard } from '../dashboard';

describe('Dashboard Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize dashboard configuration', () => {
    expect(dashboard).toBeDefined();
    expect(typeof dashboard.start).toBe('function');
  });

  it('should have dashboard instance with metrics', () => {
    expect(dashboard).toHaveProperty('start');
    expect(dashboard).toHaveProperty('metrics');
  });

  it('should start dashboard server', () => {
    // Test basic functionality
    expect(() => dashboard.start()).not.toThrow();
  });
});