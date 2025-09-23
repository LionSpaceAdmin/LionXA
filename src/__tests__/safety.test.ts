import { containsProfanity } from '../safety';

describe('containsProfanity', () => {
  it('should return false for words that contain profanity as a substring', () => {
    expect(containsProfanity('Scunthorpe')).toBe(false);
    expect(containsProfanity('assassin')).toBe(false);
  });

  it('should return true for profane words', () => {
    expect(containsProfanity('asshole')).toBe(true);
    expect(containsProfanity('bitch')).toBe(true);
    expect(containsProfanity('cunt')).toBe(true);
    expect(containsProfanity('dick')).toBe(true);
    expect(containsProfanity('fuck')).toBe(true);
    expect(containsProfanity('shit')).toBe(true);
  });

  it('should return true for sentences containing profane words', () => {
    expect(containsProfanity('This is a fucking test')).toBe(true);
    expect(containsProfanity('What a piece of shit')).toBe(true);
  });

  it('should return false for sentences that do not contain profane words', () => {
    expect(containsProfanity('This is a clean sentence')).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(containsProfanity('FUCK')).toBe(true);
    expect(containsProfanity('ShIt')).toBe(true);
  });
});
