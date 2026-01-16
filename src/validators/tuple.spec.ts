import { describe, expect, it } from 'vitest';
import { tuple } from './tuple';
import { str } from './string';
import { num } from './number';
import { bool } from './boolean';
import { arr } from './array';
import { obj } from './object';
import { union } from './union';
import { nullable } from './nullable';
import { lit } from './literal';

describe.concurrent('Tuple validator', () => {
  it('should throw an error if the value is not an array', () => {
    expect(() => tuple([str(), num()]).judge('hello')).toThrow(/string.*expected array/);
    expect(() => tuple([str(), num()]).judge(123)).toThrow(/number.*expected array/);
    expect(() => tuple([str(), num()]).judge({})).toThrow(/object.*expected array/);
    expect(() => tuple([str(), num()]).judge(null)).toThrow(/null.*expected array/);
    expect(() => tuple([str(), num()]).judge(undefined)).toThrow(
      /undefined.*expected array/
    );
  });

  it('should throw an error if length does not match', () => {
    expect(() => tuple([str(), num()]).judge(['hello'])).toThrow('Expected 2 elements, got 1');
    expect(() => tuple([str(), num()]).judge(['hello', 123, true])).toThrow(
      'Expected 2 elements, got 3'
    );
  });

  it('should validate each element with corresponding validator', () => {
    // First element (123) should be string but is number
    expect(() => tuple([str(), num()]).judge([123, 456])).toThrow(
      /number.*expected string/
    );
    expect(() => tuple([str(), num()]).judge(['hello', 'world'])).toThrow(
      /string.*expected number/
    );
    expect(() => tuple([num(), num(), num()]).judge([1, 2, 'three'])).toThrow(
      /string.*expected number/
    );
  });

  it('should return the value if it is valid', () => {
    expect(tuple([str(), num()]).judge(['hello', 123])).toEqual(['hello', 123]);
    expect(tuple([num(), str(), bool()]).judge([42, 'test', true])).toEqual([42, 'test', true]);
  });

  it('should work with many elements', () => {
    const validator = tuple([str(), num(), bool(), str(), num()]);
    expect(validator.judge(['a', 1, true, 'b', 2])).toEqual(['a', 1, true, 'b', 2]);
  });

  it('should work with nested arrays', () => {
    const validator = tuple([arr(str()), arr(num())]);
    expect(
      validator.judge([
        ['a', 'b'],
        [1, 2],
      ])
    ).toEqual([
      ['a', 'b'],
      [1, 2],
    ]);
    expect(() =>
      validator.judge([
        ['a', 'b'],
        ['c', 'd'],
      ])
    ).toThrow('Judgment failed with 2 error(s)');
  });

  it('should work with objects', () => {
    const validator = tuple([obj({ name: str() }), obj({ age: num() })]);

    expect(validator.judge([{ name: 'Alice' }, { age: 30 }])).toEqual([
      { name: 'Alice' },
      { age: 30 },
    ]);
  });

  it('should work with unions', () => {
    const validator = tuple([union([str(), num()]), bool()]);

    expect(validator.judge(['hello', true])).toEqual(['hello', true]);
    expect(validator.judge([123, false])).toEqual([123, false]);
    expect(() => validator.judge([true, true])).toThrow(
      /boolean.*expected one of the union values/
    );
  });

  it('should work with nullable validators', () => {
    const validator = tuple([nullable(str()), num()]);
    expect(validator.judge([null, 123])).toEqual([null, 123]);
    expect(validator.judge(['hello', 123])).toEqual(['hello', 123]);
  });

  it('should work with nested tuples', () => {
    const validator = tuple([str(), tuple([num(), num()])]);

    expect(validator.judge(['point', [10, 20]])).toEqual(['point', [10, 20]]);
    expect(() => validator.judge(['point', [10]])).toThrow('Expected 2 elements, got 1');
  });

  it('should work with literals', () => {
    const httpResponse = tuple([union([lit(200), lit(404), lit(500)]), str()]);

    expect(httpResponse.judge([200, 'OK'])).toEqual([200, 'OK']);
    expect(httpResponse.judge([404, 'Not Found'])).toEqual([404, 'Not Found']);
    expect(() => httpResponse.judge([201, 'Created'])).toThrow(
      /number.*expected one of the union values/
    );
  });

  it('should work with validation options', () => {
    const validator = tuple([str({ minLen: 3 }), num({ min: 0, max: 100 })]);

    expect(validator.judge(['hello', 50])).toEqual(['hello', 50]);
    expect(() => validator.judge(['hi', 50])).toThrow('Value is too short');
    expect(() => validator.judge(['hello', 150])).toThrow('Value is too big');
  });

  describe('edge cases', () => {
    it('should handle tuples with edge values', () => {
      const validator = tuple([str(), num(), bool()]);
      expect(validator.judge(['', 0, false])).toEqual(['', 0, false]);
      expect(validator.judge(['text', NaN, true])).toEqual(['text', NaN, true]);
    });

    it('should preserve order', () => {
      const validator = tuple([num(), str()]);
      const result = validator.judge([123, 'hello']);
      expect(result[0]).toBe(123);
      expect(result[1]).toBe('hello');
    });

    it('should work with coercion', () => {
      const validator = tuple([str({ coerce: true }), num({ coerce: true })]);

      expect(validator.judge([123, '456'])).toEqual(['123', 456]);
    });
  });

  describe('common use cases', () => {
    it('should work for coordinates', () => {
      const point2D = tuple([num(), num()]);
      const point3D = tuple([num(), num(), num()]);

      expect(point2D.judge([10, 20])).toEqual([10, 20]);
      expect(point3D.judge([10, 20, 30])).toEqual([10, 20, 30]);
    });

    it('should work for key-value pairs', () => {
      const entry = tuple([str(), num()]);
      expect(entry.judge(['age', 25])).toEqual(['age', 25]);
    });

    it('should work for HTTP responses', () => {
      const response = tuple([num(), str(), obj({ headers: arr(str()) })]);
      expect(response.judge([200, 'OK', { headers: ['Content-Type', 'Authorization'] }])).toEqual([
        200,
        'OK',
        { headers: ['Content-Type', 'Authorization'] },
      ]);
    });
  });

  describe('safeParse', () => {
    it('should return success for valid tuple', () => {
      const result = tuple([str(), num()]).tryJudge(['hello', 42]);
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toEqual(['hello', 42]);
      }
    });

    it('should collect all tuple element errors', () => {
      const result = tuple([str(), num(), bool()]).tryJudge([123, 'invalid', 'yes']);
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.issues).toHaveLength(3);
        expect(result.issues.map((i) => i.path)).toEqual(['[0]', '[1]', '[2]']);
      }
    });
  });
});
