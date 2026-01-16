import { describe, expect, it } from 'vitest';
import { nullish } from './nullish';
import { str } from './string';
import { num } from './number';
import { bool } from './boolean';
import { arr } from './array';
import { obj } from './object';

describe.concurrent('Nullish validator', () => {
  describe('without default value', () => {
    it('should accept null', () => {
      expect(nullish(str()).judge(null)).toBe(null);
      expect(nullish(num()).judge(null)).toBe(null);
    });

    it('should accept undefined', () => {
      expect(nullish(str()).judge(undefined)).toBe(undefined);
      expect(nullish(num()).judge(undefined)).toBe(undefined);
    });

    it('should accept valid values', () => {
      expect(nullish(str()).judge('hello')).toBe('hello');
      expect(nullish(num()).judge(0)).toBe(0);
      expect(nullish(bool()).judge(false)).toBe(false);
    });

    it('should reject invalid values', () => {
      expect(() => nullish(str()).judge(123)).toThrow(/number.*expected string/);
      expect(() => nullish(num()).judge(true)).toThrow(/boolean.*expected number/);
    });

    it('should work with complex validators', () => {
      const validator = nullish(
        arr(
          obj({
            id: num(),
            name: str(),
          })
        )
      );

      expect(validator.judge(null)).toBe(null);
      expect(validator.judge(undefined)).toBe(undefined);
      expect(
        validator.judge([
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ])
      ).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]);
    });

    it('should distinguish between null and undefined', () => {
      const validator = nullish(str());
      expect(validator.judge(null)).toBe(null);
      expect(validator.judge(undefined)).toBe(undefined);
      expect(validator.judge(null)).not.toBe(undefined);
    });
  });

  describe('with default value', () => {
    it('should return default value when null', () => {
      expect(nullish(str(), 'default').judge(null)).toBe('default');
      expect(nullish(num(), 0).judge(null)).toBe(0);
      expect(nullish(bool(), false).judge(null)).toBe(false);
    });

    it('should return default value when undefined', () => {
      expect(nullish(str(), 'default').judge(undefined)).toBe('default');
      expect(nullish(num(), 0).judge(undefined)).toBe(0);
      expect(nullish(bool(), false).judge(undefined)).toBe(false);
    });

    it('should return actual value when provided', () => {
      expect(nullish(str(), 'default').judge('hello')).toBe('hello');
      expect(nullish(num(), 0).judge(123)).toBe(123);
      expect(nullish(bool(), false).judge(true)).toBe(true);
    });

    it('should still validate non-nullish values', () => {
      expect(() => nullish(str(), 'default').judge(123)).toThrow(
        /number.*expected string/
      );
      expect(() => nullish(num(), 0).judge('hello')).toThrow(/string.*expected number/);
    });

    it('should work with empty string as default', () => {
      expect(nullish(str(), '').judge(null)).toBe('');
      expect(nullish(str(), '').judge(undefined)).toBe('');
      expect(nullish(str(), '').judge('hello')).toBe('hello');
    });

    it('should work with zero as default', () => {
      expect(nullish(num(), 0).judge(null)).toBe(0);
      expect(nullish(num(), 0).judge(undefined)).toBe(0);
      expect(nullish(num(), 0).judge(42)).toBe(42);
    });

    it('should work with false as default', () => {
      expect(nullish(bool(), false).judge(null)).toBe(false);
      expect(nullish(bool(), false).judge(undefined)).toBe(false);
      expect(nullish(bool(), false).judge(true)).toBe(true);
    });

    it('should work with array as default', () => {
      const defaultArray = [1, 2, 3];
      expect(nullish(arr(num()), defaultArray).judge(null)).toBe(defaultArray);
      expect(nullish(arr(num()), defaultArray).judge(undefined)).toBe(defaultArray);
      expect(nullish(arr(num()), defaultArray).judge([4, 5])).toEqual([4, 5]);
    });

    it('should work with object as default', () => {
      const defaultObj = { name: 'Guest', age: 0 };
      const validator = nullish(obj({ name: str(), age: num() }), defaultObj);
      expect(validator.judge(null)).toBe(defaultObj);
      expect(validator.judge(undefined)).toBe(defaultObj);
      expect(validator.judge({ name: 'Alice', age: 30 })).toEqual({ name: 'Alice', age: 30 });
    });

    it('should work with negative numbers as default', () => {
      expect(nullish(num(), -1).judge(null)).toBe(-1);
      expect(nullish(num(), -1).judge(undefined)).toBe(-1);
      expect(nullish(num(), -1).judge(5)).toBe(5);
    });
  });

  describe('common use cases', () => {
    it('should work for API responses', () => {
      // API might return null or field might be missing (undefined)
      const apiField = nullish(str(), 'N/A');

      expect(apiField.judge(null)).toBe('N/A');
      expect(apiField.judge(undefined)).toBe('N/A');
      expect(apiField.judge('actual value')).toBe('actual value');
    });

    it('should work for database columns', () => {
      // Database columns can be NULL or missing
      const dbColumn = nullish(num(), -1);

      expect(dbColumn.judge(null)).toBe(-1);
      expect(dbColumn.judge(undefined)).toBe(-1);
      expect(dbColumn.judge(0)).toBe(0);
      expect(dbColumn.judge(42)).toBe(42);
    });

    it('should work in object schemas with defaults', () => {
      const userSchema = obj({
        name: str(),
        bio: nullish(str(), 'No bio provided'),
        age: nullish(num(), 18),
        active: nullish(bool(), true),
      });

      // Both null and undefined use defaults
      expect(
        userSchema.judge({
          name: 'Alice',
          bio: null,
          age: undefined,
          active: null,
        })
      ).toEqual({
        name: 'Alice',
        bio: 'No bio provided',
        age: 18,
        active: true,
      });

      // Actual values
      expect(
        userSchema.judge({
          name: 'Bob',
          bio: 'Software engineer',
          age: 25,
          active: false,
        })
      ).toEqual({
        name: 'Bob',
        bio: 'Software engineer',
        age: 25,
        active: false,
      });

      // Mix of null, undefined, and values
      expect(
        userSchema.judge({
          name: 'Charlie',
          bio: undefined,
          age: 30,
          active: null,
        })
      ).toEqual({
        name: 'Charlie',
        bio: 'No bio provided',
        age: 30,
        active: true,
      });
    });
  });

  describe('safeParse', () => {
    it('should return success for null', () => {
      const result = nullish(str()).tryJudge(null);
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toBeNull();
      }
    });

    it('should return success for undefined', () => {
      const result = nullish(num()).tryJudge(undefined);
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toBeUndefined();
      }
    });

    it('should return success for valid value', () => {
      const result = nullish(str()).tryJudge('hello');
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toBe('hello');
      }
    });
  });
});
