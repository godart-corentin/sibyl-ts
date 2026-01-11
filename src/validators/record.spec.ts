import { describe, expect, it } from 'vitest';
import { record } from './record';
import { str } from './string';
import { num } from './number';
import { bool } from './boolean';
import { arr } from './array';
import { obj } from './object';
import { union } from './union';
import { nullable } from './nullable';
import { lit } from './literal';

describe.concurrent('Record validator', () => {
  it('should throw an error if the value is not an object', () => {
    expect(() => record(str(), num()).judge('hello')).toThrow('Value is string, expected object');
    expect(() => record(str(), num()).judge(123)).toThrow('Value is number, expected object');
    expect(() => record(str(), num()).judge(true)).toThrow('Value is boolean, expected object');
  });

  it('should throw an error if the value is null or undefined', () => {
    expect(() => record(str(), num()).judge(null)).toThrow('Value is null, expected object');
    expect(() => record(str(), num()).judge(undefined)).toThrow(
      'Value is undefined, expected object'
    );
  });

  it('should throw an error if the value is an array', () => {
    expect(() => record(str(), num()).judge([])).toThrow('Value is array, expected object');
    expect(() => record(str(), num()).judge([1, 2, 3])).toThrow('Value is array, expected object');
  });

  it('should throw an error if the value is a Date', () => {
    expect(() => record(str(), num()).judge(new Date())).toThrow('Value is date, expected object');
  });

  it('should validate keys with the key validator', () => {
    const validator = record(str({ pattern: '^[a-z]+$' }), num());
    expect(() => validator.judge({ INVALID: 123 })).toThrow('Value does not match the pattern');
    expect(() => validator.judge({ 'key-with-dash': 123 })).toThrow(
      'Value does not match the pattern'
    );
  });

  it('should validate values with the value validator', () => {
    const validator = record(str(), num());
    expect(() => validator.judge({ key: 'not a number' })).toThrow(
      'Value is string, expected number'
    );
    expect(() => validator.judge({ a: 1, b: '2' })).toThrow('Value is string, expected number');
  });

  it('should return the value if it is valid', () => {
    expect(record(str(), num()).judge({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
    expect(record(str(), str()).judge({ name: 'Alice', city: 'NYC' })).toEqual({
      name: 'Alice',
      city: 'NYC',
    });
  });

  it('should handle empty objects', () => {
    expect(record(str(), num()).judge({})).toEqual({});
  });

  it('should work with different value types', () => {
    expect(record(str(), bool()).judge({ active: true, disabled: false })).toEqual({
      active: true,
      disabled: false,
    });
  });

  it('should work with arrays as values', () => {
    const validator = record(str(), arr(num()));
    expect(
      validator.judge({
        scores: [90, 85, 88],
        grades: [100, 95],
      })
    ).toEqual({
      scores: [90, 85, 88],
      grades: [100, 95],
    });
  });

  it('should work with objects as values', () => {
    const validator = record(
      str(),
      obj({
        name: str(),
        age: num(),
      })
    );

    expect(
      validator.judge({
        user1: { name: 'Alice', age: 30 },
        user2: { name: 'Bob', age: 25 },
      })
    ).toEqual({
      user1: { name: 'Alice', age: 30 },
      user2: { name: 'Bob', age: 25 },
    });
  });

  it('should work with unions as values', () => {
    const validator = record(str(), union([str(), num()]));
    expect(
      validator.judge({
        name: 'Alice',
        age: 30,
        city: 'NYC',
      })
    ).toEqual({
      name: 'Alice',
      age: 30,
      city: 'NYC',
    });
  });

  it('should work with nullable values', () => {
    const validator = record(str(), nullable(num()));
    expect(
      validator.judge({
        a: 1,
        b: null,
        c: 3,
      })
    ).toEqual({
      a: 1,
      b: null,
      c: 3,
    });
  });

  it('should work with validation options', () => {
    const validator = record(str({ minLen: 2 }), num({ min: 0, max: 100 }));

    expect(validator.judge({ ab: 50, cd: 75 })).toEqual({ ab: 50, cd: 75 });
    expect(() => validator.judge({ a: 50 })).toThrow('Value is too short');
    expect(() => validator.judge({ ab: 150 })).toThrow('Value is too big');
  });

  it('should work with coercion', () => {
    const validator = record(str({ coerce: true }), num({ coerce: true }));

    // Keys should already be strings in JavaScript objects
    expect(validator.judge({ a: '123', b: '456' })).toEqual({ a: 123, b: 456 });
  });

  describe('edge cases', () => {
    it('should handle special characters in keys', () => {
      const validator = record(str(), num());
      expect(
        validator.judge({
          'key-with-dash': 1,
          key_with_underscore: 2,
          'key.with.dots': 3,
        })
      ).toEqual({
        'key-with-dash': 1,
        key_with_underscore: 2,
        'key.with.dots': 3,
      });
    });

    it('should handle numeric string keys', () => {
      const validator = record(str(), str());
      expect(
        validator.judge({
          '0': 'zero',
          '1': 'one',
          '123': 'one-two-three',
        })
      ).toEqual({
        '0': 'zero',
        '1': 'one',
        '123': 'one-two-three',
      });
    });

    it('should validate all entries', () => {
      const validator = record(str(), num());
      expect(() =>
        validator.judge({
          a: 1,
          b: 2,
          c: 'invalid',
          d: 4,
        })
      ).toThrow('Value is string, expected number');
    });

    it('should handle values with zero and empty string', () => {
      const validator = record(str(), union([num(), str()]));
      expect(
        validator.judge({
          count: 0,
          name: '',
        })
      ).toEqual({
        count: 0,
        name: '',
      });
    });
  });

  describe('common use cases', () => {
    it('should work for scores/grades', () => {
      const grades = record(str(), num());
      expect(
        grades.judge({
          alice: 90,
          bob: 85,
          charlie: 92,
        })
      ).toEqual({
        alice: 90,
        bob: 85,
        charlie: 92,
      });
    });

    it('should work for configuration objects', () => {
      const config = record(str(), union([str(), num(), bool()]));
      expect(
        config.judge({
          host: 'localhost',
          port: 3000,
          debug: true,
          apiKey: 'secret',
        })
      ).toEqual({
        host: 'localhost',
        port: 3000,
        debug: true,
        apiKey: 'secret',
      });
    });

    it('should work for user maps', () => {
      const userMap = record(
        str(),
        obj({
          name: str(),
          email: str(),
          active: bool(),
        })
      );

      expect(
        userMap.judge({
          'user-123': { name: 'Alice', email: 'alice@example.com', active: true },
          'user-456': { name: 'Bob', email: 'bob@example.com', active: false },
        })
      ).toEqual({
        'user-123': { name: 'Alice', email: 'alice@example.com', active: true },
        'user-456': { name: 'Bob', email: 'bob@example.com', active: false },
      });
    });

    it('should work for nested records', () => {
      const nestedRecord = record(str(), record(str(), num()));
      expect(
        nestedRecord.judge({
          group1: { a: 1, b: 2 },
          group2: { x: 10, y: 20 },
        })
      ).toEqual({
        group1: { a: 1, b: 2 },
        group2: { x: 10, y: 20 },
      });
    });

    it('should work for literal key validation', () => {
      const statusCodes = record(union([lit('success'), lit('error'), lit('pending')]), num());

      expect(
        statusCodes.judge({
          success: 200,
          error: 500,
          pending: 102,
        })
      ).toEqual({
        success: 200,
        error: 500,
        pending: 102,
      });

      expect(() =>
        statusCodes.judge({
          invalid: 999,
        })
      ).toThrow('Value is string, expected one of the union values');
    });
  });

  describe('safeParse', () => {
    it('should return success for valid record', () => {
      const result = record(str(), num()).tryJudge({ a: 1, b: 2 });
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toEqual({ a: 1, b: 2 });
      }
    });

    it('should collect all value errors', () => {
      const result = record(str(), num()).tryJudge({ a: 1, b: 'invalid', c: 3, d: 'bad' });
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.issues).toHaveLength(2);
        const paths = result.issues.map((i) => i.path).sort();
        expect(paths).toEqual(['b', 'd']);
      }
    });
  });
});
