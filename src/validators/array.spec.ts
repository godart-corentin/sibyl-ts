import { describe, expect, it } from 'vitest';
import { arr } from './array';
import { str } from './string';
import { num } from './number';
import { obj } from './object';
import { union } from './union';

describe.concurrent('Array validator', () => {
  it('should throw an error if the value is not an array', () => {
    expect(() => arr(str()).judge('hello')).toThrow(/string.*expected array/);
  });

  it('should throw an error if the value is too short', () => {
    expect(() => arr(str(), { minLen: 3 }).judge(['hello', 'world'])).toThrow('Value is too short');
  });

  it('should throw an error if the value is too long', () => {
    expect(() =>
      arr(str(), { maxLen: 5 }).judge(['hello', 'world', 'this', 'is', 'too', 'long'])
    ).toThrow('Value is too long');
  });

  it('should return the value if it is valid', () => {
    expect(arr(str()).judge(['hello', 'world', 'this', 'is', 'valid'])).toEqual([
      'hello',
      'world',
      'this',
      'is',
      'valid',
    ]);
  });

  describe('array of unions', () => {
    it('should validate arrays containing mixed types', () => {
      const mixedArray = arr(union([str(), num()]));

      expect(mixedArray.judge(['hello', 123, 'world', 456])).toEqual(['hello', 123, 'world', 456]);
    });

    it('should throw if any item is not valid for any union member', () => {
      const mixedArray = arr(union([str(), num()]));

      expect(() => mixedArray.judge(['hello', 123, true])).toThrow(
        /boolean.*expected one of the union values/
      );
    });

    it('should work with validation options on union members', () => {
      const strictArray = arr(union([str({ pattern: '^[a-z]+$' }), num({ min: 0, max: 100 })]));

      expect(strictArray.judge(['hello', 42, 'world', 99])).toEqual(['hello', 42, 'world', 99]);
      expect(() => strictArray.judge(['hello', 200])).toThrow(
        /number.*expected one of the union values/
      ); // 200 > max
      expect(() => strictArray.judge(['HELLO'])).toThrow(
        /string.*expected one of the union values/
      );
    });

    it('should work with array length validation', () => {
      const mixedArray = arr(union([str(), num()]), { minLen: 2, maxLen: 4 });

      expect(mixedArray.judge(['hello', 123])).toEqual(['hello', 123]);
      expect(() => mixedArray.judge(['hello'])).toThrow('Value is too short');
      expect(() => mixedArray.judge(['a', 'b', 'c', 'd', 'e'])).toThrow('Value is too long');
    });
  });

  describe('edge cases', () => {
    it('should handle empty arrays', () => {
      expect(arr(str()).judge([])).toEqual([]);
      expect(() => arr(str(), { minLen: 1 }).judge([])).toThrow('Value is too short');
    });

    it('should handle single element arrays', () => {
      expect(arr(num()).judge([42])).toEqual([42]);
      expect(arr(str(), { maxLen: 1 }).judge(['hello'])).toEqual(['hello']);
    });

    it('should validate all elements, not just first', () => {
      expect(() => arr(num()).judge([1, 2, 'three', 4])).toThrow(
        /string.*expected number/
      );
      expect(() => arr(str()).judge(['a', 'b', 'c', 123])).toThrow(
        /number.*expected string/
      );
    });

    it('should work with nested arrays', () => {
      const nestedValidator = arr(arr(num()));
      expect(
        nestedValidator.judge([
          [1, 2],
          [3, 4],
        ])
      ).toEqual([
        [1, 2],
        [3, 4],
      ]);
      expect(() => nestedValidator.judge([[1, 2], ['invalid']])).toThrow(
        /string.*expected number/
      );
    });

    it('should handle exact length validation', () => {
      const exactLength = arr(str(), { minLen: 3, maxLen: 3 });
      expect(exactLength.judge(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
      expect(() => exactLength.judge(['a', 'b'])).toThrow('Value is too short');
      expect(() => exactLength.judge(['a', 'b', 'c', 'd'])).toThrow('Value is too long');
    });

    it('should work with validators that have options', () => {
      const validator = arr(str({ minLen: 2, maxLen: 5 }));
      expect(validator.judge(['ab', 'abc', 'abcd'])).toEqual(['ab', 'abc', 'abcd']);
      expect(() => validator.judge(['a'])).toThrow('Value is too short');
      expect(() => validator.judge(['toolong'])).toThrow('Value is too long');
    });

    it('should handle arrays with undefined values', () => {
      expect(() => arr(str()).judge(['a', undefined, 'c'])).toThrow(
        /undefined.*expected string/
      );
    });
  });

  describe('safeParse', () => {
    it('should return success for valid array', () => {
      const result = arr(str()).tryJudge(['a', 'b', 'c']);
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toEqual(['a', 'b', 'c']);
      }
    });

    it('should collect all element errors', () => {
      const result = arr(num()).tryJudge([1, 'two', 3, 'four']);
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.issues).toHaveLength(2);
        expect(result.issues[0].path).toBe('[1]');
        expect(result.issues[1].path).toBe('[3]');
      }
    });

    it('should include paths for arrays in objects', () => {
      const validator = arr(obj({ name: str() }));
      const result = validator.tryJudge([{ name: 'Alice' }, { name: 123 }]);

      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.issues[0].path).toBe('[1].name');
      }
    });
  });
});
