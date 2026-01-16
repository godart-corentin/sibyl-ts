import { describe, expect, it } from 'vitest';
import { obj } from './object';
import { arr } from '../array';
import { str } from '../string';
import { num } from '../number';
import { bool } from '../boolean';
import { union } from '../union';

describe.concurrent('Object validator', () => {
  it('should throw an error if the value is not an object', () => {
    expect(() => obj({}).judge('hello')).toThrow(/string.*expected object/);
    expect(() => obj({}).judge(null)).toThrow(/null.*expected object/);
    expect(() => obj({}).judge(undefined)).toThrow(/undefined.*expected object/);
    expect(() => obj({}).judge([])).toThrow(/array.*expected object/);
  });

  it('should throw if the object does not match the schema', () => {
    // Missing properties pass undefined to validators, which then throw their own errors
    // When multiple properties fail, we get a multi-error message
    expect(() => obj({ a: str(), b: num() }).judge({})).toThrow('Judgment failed with 2 error(s)');
    expect(() => obj({ a: str(), b: bool() }).judge({ a: 'hello', b: 'world' })).toThrow(
      /string.*expected boolean/
    );
    expect(() => obj({ a: str(), b: arr(str()) }).judge({ a: 'hello', b: true })).toThrow(
      /boolean.*expected array/
    );
  });

  it('should return the value if it is valid', () => {
    expect(obj({}).judge({})).toEqual({});
    expect(obj({ a: str(), b: num() }).judge({ a: 'hello', b: 123 })).toEqual({
      a: 'hello',
      b: 123,
    });
    expect(obj({ a: str(), b: arr(str()) }).judge({ a: 'hello', b: ['world'] })).toEqual({
      a: 'hello',
      b: ['world'],
    });
  });

  it('should not mutate the original object', () => {
    const original = { a: 'hello', b: 123 };
    const validator = obj({ a: str(), b: num() });
    const result = validator.judge(original);

    expect(result).toEqual(original);
    expect(result).not.toBe(original); // Different object reference
  });

  it('should work with nested objects', () => {
    const userValidator = obj({
      name: str(),
      age: num(),
      address: obj({
        street: str(),
        city: str(),
      }),
    });

    const validUser = {
      name: 'John',
      age: 30,
      address: {
        street: '123 Main St',
        city: 'NYC',
      },
    };

    expect(userValidator.judge(validUser)).toEqual(validUser);

    expect(() =>
      userValidator.judge({
        name: 'John',
        age: 30,
        address: { street: '123 Main St' }, // missing city
      })
    ).toThrow(/undefined.*expected string/);
  });

  it('should work with complex schemas', () => {
    const complexValidator = obj({
      id: num(),
      name: str(),
      active: bool(),
      tags: arr(str()),
      metadata: union([str(), num(), bool()]),
    });

    expect(
      complexValidator.judge({
        id: 1,
        name: 'test',
        active: true,
        tags: ['tag1', 'tag2'],
        metadata: 'some value',
      })
    ).toEqual({
      id: 1,
      name: 'test',
      active: true,
      tags: ['tag1', 'tag2'],
      metadata: 'some value',
    });

    expect(
      complexValidator.judge({
        id: 1,
        name: 'test',
        active: true,
        tags: ['tag1', 'tag2'],
        metadata: 42,
      })
    ).toEqual({
      id: 1,
      name: 'test',
      active: true,
      tags: ['tag1', 'tag2'],
      metadata: 42,
    });
  });

  describe('edge cases', () => {
    it('should handle empty schemas', () => {
      expect(obj({}).judge({})).toEqual({});
      expect(obj({}).judge({ extra: 'ignored' })).toEqual({});
    });

    it('should allow extra properties not in schema', () => {
      const validator = obj({ name: str() });
      const result = validator.judge({ name: 'John', age: 30, extra: 'value' });
      expect(result.name).toBe('John');
      // Note: extra properties are not included in result since they're not in schema
    });

    it('should reject null and undefined', () => {
      expect(() => obj({ a: str() }).judge(null)).toThrow(/null.*expected object/);
      expect(() => obj({ a: str() }).judge(undefined)).toThrow(/undefined.*expected object/);
    });

    it('should reject arrays', () => {
      expect(() => obj({ a: str() }).judge([])).toThrow(/array.*expected object/);
      expect(() => obj({ a: str() }).judge([1, 2, 3])).toThrow(/array.*expected object/);
    });

    it('should reject Date objects', () => {
      expect(() => obj({ a: str() }).judge(new Date())).toThrow(/date.*expected object/);
    });

    it('should handle objects with undefined values', () => {
      // Missing properties pass undefined, which str()/num() will reject
      expect(() => obj({ a: str(), b: num() }).judge({ a: 'test' })).toThrow(
        /undefined.*expected number/
      );
      expect(() => obj({ a: str(), b: num() }).judge({ a: 'test', b: undefined })).toThrow(
        /undefined.*expected number/
      );
    });

    it('should work with deeply nested objects', () => {
      const deepValidator = obj({
        level1: obj({
          level2: obj({
            level3: str(),
          }),
        }),
      });

      expect(
        deepValidator.judge({
          level1: {
            level2: {
              level3: 'deep',
            },
          },
        })
      ).toEqual({
        level1: {
          level2: {
            level3: 'deep',
          },
        },
      });
    });

    it('should validate all properties', () => {
      const validator = obj({ a: str(), b: num(), c: bool() });

      expect(() => validator.judge({ a: 'test', b: 'invalid', c: true })).toThrow(
        /string.*expected number/
      );
      expect(() => validator.judge({ a: 'test', b: 123, c: 'invalid' })).toThrow(
        /string.*expected boolean/
      );
    });

    it('should work with mixed nested structures', () => {
      const validator = obj({
        users: arr(
          obj({
            name: str(),
            scores: arr(num()),
          })
        ),
      });

      expect(
        validator.judge({
          users: [
            { name: 'Alice', scores: [90, 85, 88] },
            { name: 'Bob', scores: [75, 80] },
          ],
        })
      ).toEqual({
        users: [
          { name: 'Alice', scores: [90, 85, 88] },
          { name: 'Bob', scores: [75, 80] },
        ],
      });
    });
  });

  describe('safeParse', () => {
    it('should return success for valid object', () => {
      const validator = obj({ name: str(), age: num() });
      const result = validator.tryJudge({ name: 'John', age: 30 });

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toEqual({ name: 'John', age: 30 });
      }
    });

    it('should collect all property errors', () => {
      const validator = obj({ name: str(), age: num(), active: bool() });
      const result = validator.tryJudge({ name: 123, age: 'invalid', active: 'yes' });

      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.issues).toHaveLength(3);
        const paths = result.issues.map((i: { path: string }) => i.path).sort();
        expect(paths).toEqual(['active', 'age', 'name']);
      }
    });

    it('should include correct paths for nested objects', () => {
      const validator = obj({
        user: obj({ name: str(), age: num() }),
      });

      const result = validator.tryJudge({
        user: { name: 123, age: 'invalid' },
      });

      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.issues).toHaveLength(2);
        const paths = result.issues.map((i: { path: string }) => i.path).sort();
        expect(paths).toEqual(['user.age', 'user.name']);
      }
    });
  });
});
