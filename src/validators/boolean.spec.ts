import { describe, expect, it } from 'vitest';
import { bool } from './boolean';

describe.concurrent('Boolean validator', () => {
  describe('strict mode (default)', () => {
    it('should throw an error if the value is not a boolean', () => {
      expect(() => bool().judge('hello')).toThrow('Value is string, expected boolean');
      expect(() => bool().judge('true')).toThrow('Value is string, expected boolean');
      expect(() => bool().judge(1)).toThrow('Value is number, expected boolean');
      expect(() => bool().judge(0)).toThrow('Value is number, expected boolean');
      expect(() => bool().judge(null)).toThrow('Value is null, expected boolean');
      expect(() => bool().judge(undefined)).toThrow('Value is undefined, expected boolean');
    });

    it('should return the value if it is a boolean', () => {
      expect(bool().judge(true)).toBe(true);
      expect(bool().judge(false)).toBe(false);
    });
  });

  describe('coerce mode', () => {
    it('should coerce string "true"/"false" to boolean', () => {
      expect(bool({ coerce: true }).judge('true')).toBe(true);
      expect(bool({ coerce: true }).judge('false')).toBe(false);
    });

    it('should coerce numbers 1/0 to boolean', () => {
      expect(bool({ coerce: true }).judge(1)).toBe(true);
      expect(bool({ coerce: true }).judge(0)).toBe(false);
    });

    it('should coerce string numbers "1"/"0" to boolean', () => {
      expect(bool({ coerce: true }).judge('1')).toBe(true);
      expect(bool({ coerce: true }).judge('0')).toBe(false);
    });

    it('should coerce empty string, null, undefined to false', () => {
      expect(bool({ coerce: true }).judge('')).toBe(false);
      expect(bool({ coerce: true }).judge(null)).toBe(false);
      expect(bool({ coerce: true }).judge(undefined)).toBe(false);
    });

    it('should use truthy/falsy for other values', () => {
      expect(bool({ coerce: true }).judge('hello')).toBe(true);
      expect(bool({ coerce: true }).judge(42)).toBe(true);
      expect(bool({ coerce: true }).judge([])).toBe(true);
      expect(bool({ coerce: true }).judge({})).toBe(true);
    });

    it('should pass through actual booleans', () => {
      expect(bool({ coerce: true }).judge(true)).toBe(true);
      expect(bool({ coerce: true }).judge(false)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should only accept boolean in strict mode', () => {
      expect(() => bool().judge(0)).toThrow('Value is number, expected boolean');
      expect(() => bool().judge(1)).toThrow('Value is number, expected boolean');
      expect(() => bool().judge('')).toThrow('Value is string, expected boolean');
      expect(() => bool().judge('false')).toThrow('Value is string, expected boolean');
    });

    it('should handle case sensitivity in coerce mode', () => {
      expect(bool({ coerce: true }).judge('true')).toBe(true);
      expect(bool({ coerce: true }).judge('false')).toBe(false);
      expect(bool({ coerce: true }).judge('TRUE')).toBe(true); // truthy, not 'true'
      expect(bool({ coerce: true }).judge('FALSE')).toBe(true); // truthy, not 'false'
    });

    it('should handle all falsy values in coerce mode', () => {
      expect(bool({ coerce: true }).judge(false)).toBe(false);
      expect(bool({ coerce: true }).judge(0)).toBe(false);
      expect(bool({ coerce: true }).judge('0')).toBe(false);
      expect(bool({ coerce: true }).judge('')).toBe(false);
      expect(bool({ coerce: true }).judge(null)).toBe(false);
      expect(bool({ coerce: true }).judge(undefined)).toBe(false);
    });

    it('should handle all truthy values in coerce mode', () => {
      expect(bool({ coerce: true }).judge(true)).toBe(true);
      expect(bool({ coerce: true }).judge(1)).toBe(true);
      expect(bool({ coerce: true }).judge('1')).toBe(true);
      expect(bool({ coerce: true }).judge('any string')).toBe(true);
      expect(bool({ coerce: true }).judge([])).toBe(true);
      expect(bool({ coerce: true }).judge({})).toBe(true);
      expect(bool({ coerce: true }).judge(42)).toBe(true);
    });
  });

  describe('safeParse', () => {
    it('should return success for valid boolean', () => {
      const result = bool().tryJudge(true);
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toBe(true);
      }
    });

    it('should return error for invalid boolean', () => {
      const result = bool().tryJudge('yes');
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.issues[0].message).toBe('Value is string, expected boolean');
      }
    });
  });
});
