import { describe, expect, it } from 'vitest';
import { str } from './string';

describe.concurrent('String validator', () => {
  describe('strict mode (default)', () => {
    it('should throw an error if the value is not a string', () => {
      expect(() => str().judge(3)).toThrow('Value is number, expected string');
      expect(() => str().judge(true)).toThrow('Value is boolean, expected string');
      expect(() => str().judge(null)).toThrow('Value is null, expected string');
    });

    it('should throw an error if the value is too short', () => {
      expect(() => str({ minLen: 5 }).judge('1234')).toThrow(
        'Value is too short, expected at least 5 characters'
      );
    });

    it('should throw an error if the value is too long', () => {
      expect(() => str({ maxLen: 5 }).judge('123456')).toThrow(
        'Value is too long, expected at most 5 characters'
      );
    });

    it('should throw an error if the value does not match the pattern', () => {
      expect(() => str({ pattern: '^[0-9]+$' }).judge('abc')).toThrow(
        'Value does not match the pattern'
      );
    });

    it('should return the value if it is valid', () => {
      expect(str().judge('1234')).toBe('1234');
    });
  });

  describe('coerce mode', () => {
    it('should coerce numbers to string', () => {
      expect(str({ coerce: true }).judge(123)).toBe('123');
      expect(str({ coerce: true }).judge(42.5)).toBe('42.5');
    });

    it('should coerce booleans to string', () => {
      expect(str({ coerce: true }).judge(true)).toBe('true');
      expect(str({ coerce: true }).judge(false)).toBe('false');
    });

    it('should coerce null and undefined to string', () => {
      expect(str({ coerce: true }).judge(null)).toBe('null');
      expect(str({ coerce: true }).judge(undefined)).toBe('undefined');
    });

    it('should coerce objects/arrays to string', () => {
      expect(str({ coerce: true }).judge({})).toBe('[object Object]');
      expect(str({ coerce: true }).judge([])).toBe('');
      expect(str({ coerce: true }).judge([1, 2, 3])).toBe('1,2,3');
    });

    it('should pass through actual strings', () => {
      expect(str({ coerce: true }).judge('hello')).toBe('hello');
    });

    it('should apply validation after coercion', () => {
      expect(() => str({ coerce: true, minLen: 5 }).judge(123)).toThrow(
        'Value is too short, expected at least 5 characters'
      );
      expect(str({ coerce: true, minLen: 3 }).judge(123)).toBe('123');

      expect(() => str({ coerce: true, pattern: '^[0-9]+$' }).judge(true)).toThrow(
        'Value does not match the pattern'
      );
      expect(str({ coerce: true, pattern: '^[0-9]+$' }).judge(123)).toBe('123');
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      expect(str().judge('')).toBe('');
      expect(() => str({ minLen: 1 }).judge('')).toThrow(
        'Value is too short, expected at least 1 characters'
      );
    });

    it('should handle unicode characters', () => {
      expect(str().judge('Hello 👋 World 🌍')).toBe('Hello 👋 World 🌍');
      expect(str({ minLen: 5 }).judge('Hello 👋')).toBe('Hello 👋');
    });

    it('should handle special characters in patterns', () => {
      expect(str({ pattern: '^[a-zA-Z0-9_-]+$' }).judge('hello-world_123')).toBe('hello-world_123');
      expect(() => str({ pattern: '^[a-zA-Z0-9_-]+$' }).judge('hello@world')).toThrow(
        'Value does not match the pattern'
      );
    });

    it('should work with combined validations', () => {
      const validator = str({ minLen: 3, maxLen: 10, pattern: '^[a-z]+$' });
      expect(validator.judge('hello')).toBe('hello');
      expect(() => validator.judge('hi')).toThrow(
        'Value is too short, expected at least 3 characters'
      );
      expect(() => validator.judge('verylongstring')).toThrow(
        'Value is too long, expected at most 10 characters'
      );
      expect(() => validator.judge('HELLO')).toThrow('Value does not match the pattern');
    });

    it('should handle exact length validation', () => {
      const exactLength = str({ minLen: 5, maxLen: 5 });
      expect(exactLength.judge('hello')).toBe('hello');
      expect(() => exactLength.judge('hi')).toThrow(
        'Value is too short, expected at least 5 characters'
      );
      expect(() => exactLength.judge('toolong')).toThrow(
        'Value is too long, expected at most 5 characters'
      );
    });
  });

  describe('safeParse', () => {
    it('should return success for valid string', () => {
      const result = str().tryJudge('hello');
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toBe('hello');
      }
    });

    it('should return error for invalid string', () => {
      const result = str().tryJudge(123);
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].message).toBe('Value is number, expected string');
        expect(result.issues[0].path).toBe('');
      }
    });

    it('should return error for validation failures', () => {
      const result = str({ minLen: 5 }).tryJudge('hi');
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.issues[0].message).toBe('Value is too short, expected at least 5 characters');
      }
    });
  });
});
