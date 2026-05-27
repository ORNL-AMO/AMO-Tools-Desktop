import { describe, it, expect } from 'vitest';

// * verify configuration/runner are setup correct so we don't report false negatives
describe('test runner', () => {
  it('is configured and running', () => {
    expect(true).toBe(true);
  });
});
