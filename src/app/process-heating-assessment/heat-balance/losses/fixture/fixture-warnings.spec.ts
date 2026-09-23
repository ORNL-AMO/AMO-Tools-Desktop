import { getFixtureFeedRateWarning } from './fixture-warnings';

describe('getFixtureFeedRateWarning', () => {
  it('warns when feed rate is negative', () => {
    expect(getFixtureFeedRateWarning({ feedRate: -1 })).toBe('Fixture Feed Rate must be greater than 0');
  });

  it('does not warn when feed rate is 0', () => {
    expect(getFixtureFeedRateWarning({ feedRate: 0 })).toBeNull();
  });
});
