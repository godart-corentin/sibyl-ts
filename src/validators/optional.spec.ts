import { describe, expect, it } from 'vitest';
import { optional } from './optional';
import { str } from './string';
import { num } from './number';
import { bool } from './boolean';
import { arr } from './array';
import { obj } from './object';

describe.concurrent('Optional validator', () => {
  describe('without default value', () => {
    it('should accept undefined', () => {
      expect(optional(str()).judge(undefined)).toBe(undefined);
      expect(optional(num()).judge(undefined)).toBe(undefined);
      expect(optional(bool()).judge(undefined)).toBe(undefined);
    });

    it('should accept valid values', () => {
      expect(optional(str()).judge('hello')).toBe('hello');
      expect(optional(num()).judge(123)).toBe(123);
      expect(optional(bool()).judge(false)).toBe(false);
    });

    it('should reject null', () => {
      expect(() => optional(str()).judge(null)).toThrow(/null.*expected string/);
    });

    it('should reject invalid values', () => {
      expect(() => optional(str()).judge(123)).toThrow(/number.*expected string/);
      expect(() => optional(num()).judge('hello')).toThrow(/string.*expected number/);
    });

    it('should work with arrays', () => {
      expect(optional(arr(num())).judge(undefined)).toBe(undefined);
      expect(optional(arr(num())).judge([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it('should work with objects', () => {
      const validator = optional(obj({ age: num() }));
      expect(validator.judge(undefined)).toBe(undefined);
      expect(validator.judge({ age: 30 })).toEqual({ age: 30 });
    });

    it('should work with coercion', () => {
      const validator = optional(str({ coerce: true }));
      expect(validator.judge(undefined)).toBe(undefined);
      expect(validator.judge(123)).toBe('123');
      expect(validator.judge(true)).toBe('true');
    });

    it('should handle empty string vs undefined', () => {
      expect(optional(str()).judge('')).toBe('');
      expect(optional(str()).judge(undefined)).toBe(undefined);
    });

    it('should handle false vs undefined', () => {
      expect(optional(bool()).judge(false)).toBe(false);
      expect(optional(bool()).judge(undefined)).toBe(undefined);
    });
  });

  describe('with default value', () => {
    it('should return default value when undefined', () => {
      expect(optional(str(), 'default').judge(undefined)).toBe('default');
      expect(optional(num(), 0).judge(undefined)).toBe(0);
      expect(optional(bool(), false).judge(undefined)).toBe(false);
    });

    it('should return actual value when provided', () => {
      expect(optional(str(), 'default').judge('hello')).toBe('hello');
      expect(optional(num(), 0).judge(123)).toBe(123);
      expect(optional(bool(), false).judge(true)).toBe(true);
    });

    it('should still validate non-undefined values', () => {
      expect(() => optional(str(), 'default').judge(123)).toThrow(/number.*expected string/);
      expect(() => optional(num(), 0).judge('hello')).toThrow(/string.*expected number/);
    });

    it('should work with empty string as default', () => {
      expect(optional(str(), '').judge(undefined)).toBe('');
      expect(optional(str(), '').judge('hello')).toBe('hello');
    });

    it('should work with zero as default', () => {
      expect(optional(num(), 0).judge(undefined)).toBe(0);
      expect(optional(num(), 0).judge(42)).toBe(42);
    });

    it('should work with false as default', () => {
      expect(optional(bool(), false).judge(undefined)).toBe(false);
      expect(optional(bool(), false).judge(true)).toBe(true);
    });

    it('should work with array as default', () => {
      const defaultArray = [1, 2, 3];
      expect(optional(arr(num()), defaultArray).judge(undefined)).toBe(defaultArray);
      expect(optional(arr(num()), defaultArray).judge([4, 5])).toEqual([4, 5]);
    });

    it('should work with object as default', () => {
      const defaultObj = { name: 'Guest', age: 0 };
      const validator = optional(obj({ name: str(), age: num() }), defaultObj);
      expect(validator.judge(undefined)).toBe(defaultObj);
      expect(validator.judge({ name: 'Alice', age: 30 })).toEqual({ name: 'Alice', age: 30 });
    });

    it('should work with negative numbers as default', () => {
      expect(optional(num(), -1).judge(undefined)).toBe(-1);
      expect(optional(num(), -1).judge(5)).toBe(5);
    });
  });

  describe('common use cases', () => {
    it('should work for primitive defaults', () => {
      const host = optional(str(), 'localhost');
      const port = optional(num(), 3000);
      const debug = optional(bool(), false);

      expect(host.judge(undefined)).toBe('localhost');
      expect(port.judge(undefined)).toBe(3000);
      expect(debug.judge(undefined)).toBe(false);

      expect(host.judge('0.0.0.0')).toBe('0.0.0.0');
      expect(port.judge(8080)).toBe(8080);
      expect(debug.judge(true)).toBe(true);
    });

    it('should work for complex defaults', () => {
      const tags = optional(arr(str()), ['default', 'tags']);
      expect(tags.judge(undefined)).toEqual(['default', 'tags']);
      expect(tags.judge(['custom'])).toEqual(['custom']);
    });

    it('should work in object schemas', () => {
      const userSchema = obj({
        name: str(),
        role: optional(str(), 'user'),
        age: optional(num(), 18),
        active: optional(bool(), true),
      });

      // With all undefined - defaults are used
      expect(
        userSchema.judge({
          name: 'Alice',
          role: undefined,
          age: undefined,
          active: undefined,
        })
      ).toEqual({
        name: 'Alice',
        role: 'user',
        age: 18,
        active: true,
      });

      // With actual values
      expect(
        userSchema.judge({
          name: 'Bob',
          role: 'admin',
          age: 25,
          active: false,
        })
      ).toEqual({
        name: 'Bob',
        role: 'admin',
        age: 25,
        active: false,
      });

      // Mix of undefined and values
      expect(
        userSchema.judge({
          name: 'Charlie',
          role: 'moderator',
          age: undefined,
          active: undefined,
        })
      ).toEqual({
        name: 'Charlie',
        role: 'moderator',
        age: 18,
        active: true,
      });
    });
  });

  describe('safeParse', () => {
    it('should return success for undefined', () => {
      const result = optional(str()).tryJudge(undefined);
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toBeUndefined();
      }
    });

    it('should return success for valid value', () => {
      const result = optional(str()).tryJudge('hello');
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toBe('hello');
      }
    });

    it('should return error for invalid value', () => {
      const result = optional(num()).tryJudge('invalid');
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.issues[0].message).toMatch(/string.*expected number/);
      }
    });
  });
});
