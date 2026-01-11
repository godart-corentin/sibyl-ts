import { describe, expect, it } from 'vitest';
import { nullable } from './nullable';
import { str } from './string';
import { num } from './number';
import { bool } from './boolean';
import { arr } from './array';
import { obj } from './object';
import { union } from './union';

describe.concurrent('Nullable validator', () => {
  it('should accept null', () => {
    expect(nullable(str()).judge(null)).toBe(null);
    expect(nullable(num()).judge(null)).toBe(null);
    expect(nullable(bool()).judge(null)).toBe(null);
  });

  it('should accept valid values', () => {
    expect(nullable(str()).judge('hello')).toBe('hello');
    expect(nullable(num()).judge(123)).toBe(123);
    expect(nullable(bool()).judge(true)).toBe(true);
  });

  it('should reject undefined', () => {
    expect(() => nullable(str()).judge(undefined)).toThrow('Value is undefined, expected string');
  });

  it('should reject invalid values', () => {
    expect(() => nullable(str()).judge(123)).toThrow('Value is number, expected string');
    expect(() => nullable(num()).judge('hello')).toThrow('Value is string, expected number');
  });

  it('should work with arrays', () => {
    expect(nullable(arr(str())).judge(null)).toBe(null);
    expect(nullable(arr(str())).judge(['a', 'b'])).toEqual(['a', 'b']);
    // Multiple array items failing validation results in multi-error message
    expect(() => nullable(arr(str())).judge([1, 2])).toThrow('Judgment failed with 2 error(s)');
  });

  it('should work with objects', () => {
    const validator = nullable(obj({ name: str() }));
    expect(validator.judge(null)).toBe(null);
    expect(validator.judge({ name: 'John' })).toEqual({ name: 'John' });
  });

  it('should work with unions', () => {
    const validator = nullable(union([str(), num()]));
    expect(validator.judge(null)).toBe(null);
    expect(validator.judge('hello')).toBe('hello');
    expect(validator.judge(123)).toBe(123);
  });

  it('should work with nested nullable validators', () => {
    const validator = nullable(arr(nullable(str())));
    expect(validator.judge(null)).toBe(null);
    expect(validator.judge(['hello', null, 'world'])).toEqual(['hello', null, 'world']);
  });

  it('should work with validation options', () => {
    const validator = nullable(str({ minLen: 3, maxLen: 10 }));
    expect(validator.judge(null)).toBe(null);
    expect(validator.judge('hello')).toBe('hello');
    expect(() => validator.judge('hi')).toThrow('Value is too short');
    expect(() => validator.judge('verylongstring')).toThrow('Value is too long');
  });

  it('should handle 0 vs null', () => {
    expect(nullable(num()).judge(0)).toBe(0);
    expect(nullable(num()).judge(null)).toBe(null);
  });

  describe('safeParse', () => {
    it('should return success for null', () => {
      const result = nullable(str()).tryJudge(null);
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toBeNull();
      }
    });

    it('should return success for valid value', () => {
      const result = nullable(num()).tryJudge(42);
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toBe(42);
      }
    });
  });
});
