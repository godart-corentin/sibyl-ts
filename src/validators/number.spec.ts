import { describe, expect, it } from 'vitest';
import { num } from './number';

describe.concurrent('Number validator', () => {
  describe('strict mode (default)', () => {
    it('should throw an error if the value is not a number', () => {
      expect(() => num().judge('3')).toThrow(/string.*expected number/);
      expect(() => num().judge(null)).toThrow(/null.*expected number/);
      expect(() => num().judge(undefined)).toThrow(/undefined.*expected number/);
    });

    it('should throw an error if the value is too short', () => {
      expect(() => num({ min: 5 }).judge(4)).toThrow('Value is too small, expected at least 5');
    });

    it('should throw an error if the value is too big', () => {
      expect(() => num({ max: 5 }).judge(6)).toThrow('Value is too big, expected at most 5');
    });

    it('should return the value if it is valid', () => {
      expect(num().judge(1234)).toBe(1234);
    });
  });

  describe('coerce mode', () => {
    it('should coerce string numbers to number', () => {
      expect(num({ coerce: true }).judge('1234')).toBe(1234);
      expect(num({ coerce: true }).judge('42.5')).toBe(42.5);
    });

    it('should coerce boolean to number', () => {
      expect(num({ coerce: true }).judge(true)).toBe(1);
      expect(num({ coerce: true }).judge(false)).toBe(0);
    });

    it('should coerce null and empty string to 0', () => {
      expect(num({ coerce: true }).judge(null)).toBe(0);
      expect(num({ coerce: true }).judge('')).toBe(0);
    });

    it('should throw on NaN coercion (undefined, invalid strings)', () => {
      expect(() => num({ coerce: true }).judge(undefined)).toThrow(
        'Value cannot be coerced to a number'
      );
      expect(() => num({ coerce: true }).judge('hello')).toThrow(
        'Value cannot be coerced to a number'
      );
      expect(() => num({ coerce: true }).judge({})).toThrow('Value cannot be coerced to a number');
    });

    it('should apply min/max validation after coercion', () => {
      expect(() => num({ coerce: true, min: 5 }).judge('4')).toThrow(
        'Value is too small, expected at least 5'
      );
      expect(() => num({ coerce: true, max: 5 }).judge('6')).toThrow(
        'Value is too big, expected at most 5'
      );
      expect(num({ coerce: true, min: 5, max: 10 }).judge('7')).toBe(7);
    });
  });

  describe('edge cases', () => {
    it('should handle special number values', () => {
      expect(num().judge(NaN)).toBe(NaN);
      expect(num().judge(Infinity)).toBe(Infinity);
      expect(num().judge(-Infinity)).toBe(-Infinity);
    });

    it('should handle zero', () => {
      expect(num().judge(0)).toBe(0);
      expect(num().judge(-0)).toBe(-0);
    });

    it('should handle negative numbers', () => {
      expect(num().judge(-42)).toBe(-42);
      expect(num({ min: -100, max: -10 }).judge(-50)).toBe(-50);
    });

    it('should handle decimals', () => {
      expect(num().judge(3.14)).toBe(3.14);
      expect(num().judge(0.001)).toBe(0.001);
      expect(num({ min: 0, max: 1 }).judge(0.5)).toBe(0.5);
    });

    it('should work with min/max edge boundaries', () => {
      expect(num({ min: 5 }).judge(5)).toBe(5); // Exactly at min
      expect(num({ max: 10 }).judge(10)).toBe(10); // Exactly at max
      expect(num({ min: 5, max: 10 }).judge(5)).toBe(5);
      expect(num({ min: 5, max: 10 }).judge(10)).toBe(10);
    });

    it('should handle scientific notation', () => {
      expect(num().judge(1e10)).toBe(10000000000);
      expect(num().judge(1.5e-5)).toBe(0.000015);
    });

    it('should work with very large numbers', () => {
      expect(num().judge(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER);
      expect(num().judge(Number.MIN_SAFE_INTEGER)).toBe(Number.MIN_SAFE_INTEGER);
    });
  });

  describe('safeParse', () => {
    it('should return success for valid number', () => {
      const result = num().tryJudge(42);
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toBe(42);
      }
    });

    it('should return error for invalid number', () => {
      const result = num().tryJudge('hello');
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0].message).toMatch(/string.*expected number/);
      }
    });
  });
});
