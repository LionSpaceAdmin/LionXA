// Mock dependencies
jest.mock('express', () => {
  const base = () => ({
    use: jest.fn(),
    get: jest.fn(),
    listen: jest.fn(),
  });
  const withStatic = Object.assign(base, {
    // express.static mock middleware
    static: jest.fn(() => (_req: unknown, _res: unknown, next?: () => void) => {
      if (next) next();
    }),
  });
  return {
    __esModule: true,
    default: withStatic,
  };
});

jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
  })),
}));

jest.mock('http', () => ({
  createServer: jest.fn(() => ({
    listen: jest.fn((...args: unknown[]) => {
      const cb = args.find((a): a is () => void => typeof a === 'function');
      if (cb) cb();
    }),
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
