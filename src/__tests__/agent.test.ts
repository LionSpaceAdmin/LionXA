import { main } from '../agent';
import * as profiles from '../profiles';
import * as safety from '../safety';
import { logger } from '../logging';
import * as browser from '../browserService';
import { scrapeTweetsFromList } from '../agent';

jest.mock('../profiles');
jest.mock('../safety');
jest.mock('../logging');
jest.mock('../browserService', () => ({
    initialize: jest.fn(),
    getPage: jest.fn().mockResolvedValue({
        goto: jest.fn(),
        setViewportSize: jest.fn(),
        locator: jest.fn().mockReturnThis(),
        count: jest.fn().mockResolvedValue(0),
        waitForTimeout: jest.fn(),
        on: jest.fn(),
        screenshot: jest.fn().mockResolvedValue(Buffer.from('')),
        url: jest.fn().mockReturnValue('https://x.com/lists/1234'),
        reload: jest.fn(),
        close: jest.fn(),
    }),
    getBrowser: jest.fn().mockReturnValue({
        newContext: jest.fn().mockResolvedValue({
            newPage: jest.fn(),
        }),
        contexts: jest.fn().mockReturnValue([
            {
                pages: jest.fn().mockReturnValue([]),
            },
        ]),
        close: jest.fn(),
    }),
    close: jest.fn(),
}));
jest.mock('../memory', () => ({
  isSeen: jest.fn().mockReturnValue(false),
  markSeen: jest.fn(),
}));
jest.mock('../gemini', () => ({
  askGPT: jest.fn().mockResolvedValue(''),
}));
jest.mock('../dashboard', () => ({
  dashboard: {
    initAsAgentClient: jest.fn(),
  },
  logTweetProcessed: jest.fn(),
  logReplyPosted: jest.fn(),
  logGeminiCall: jest.fn(),
  logError: jest.fn(),
  sendScreencap: jest.fn(),
  control: {
    on: jest.fn(),
  },
  logPageConsole: jest.fn(),
  logException: jest.fn(),
  logAgentLog: jest.fn(),
}));
jest.mock('../backup', () => ({
  startBackupScheduler: jest.fn(),
}));
jest.mock('../agent', () => {
    const originalModule = jest.requireActual('../agent');
    return {
        ...originalModule,
        scrapeTweetsFromList: jest.fn(),
    };
});

describe('Agent Quarantine Logic', () => {
  it('should skip a quarantined profile', async () => {
    // Arrange
    const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});

    const quarantinedProfile = { username: 'Vikingwarrior20', customPrompt: '', facts: [], handles: [] };
    const getProfileSpy = jest.spyOn(profiles, 'getProfile').mockReturnValue(quarantinedProfile);
    const isProfileQuarantinedSpy = jest.spyOn(safety, 'isProfileQuarantined').mockReturnValue(true);

    (scrapeTweetsFromList as jest.Mock).mockResolvedValue([
      {
        id: '123',
        text: 'test tweet',
        author: 'Vikingwarrior20',
        username: 'Vikingwarrior20',
        fullText: 'test tweet',
        createdTime: new Date().toISOString(),
        isRepost: false,
        images: [],
        element: {} as any,
      },
    ]);

    // Act
    try {
        await main();
    } catch (e) {
        // expected error to break loop
    }

    // Assert
    expect(warnSpy).toHaveBeenCalledWith('Skipping quarantined profile: Vikingwarrior20');

    // Cleanup
    getProfileSpy.mockRestore();
    isProfileQuarantinedSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
