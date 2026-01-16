import { describe, expect, it } from 'vitest';
import { unknown } from './unknown';

describe.concurrent('Unknown validator', () => {
  it('should accept any value', () => {
    expect(unknown().judge('hello')).toBe('hello');
    expect(unknown().judge(123)).toBe(123);
    expect(unknown().judge(true)).toBe(true);
    expect(unknown().judge({})).toEqual({});
    expect(unknown().judge([])).toEqual([]);
    expect(unknown().judge(null)).toBe(null);
    expect(unknown().judge(undefined)).toBe(undefined);
  });

  describe('tryJudge', () => {
    it('should always return success', () => {
      const result = unknown().tryJudge('something');
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toBe('something');
      }
    });
  });
});
