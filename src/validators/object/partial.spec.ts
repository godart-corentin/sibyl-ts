import { describe, expect, it } from 'vitest';
import { partial } from './partial';
import { str } from '../string';
import { num } from '../number';
import { bool } from '../boolean';
import { obj } from './object';

describe.concurrent('Partial validator', () => {
  it('should accept empty objects', () => {
    const validator = partial(obj({ name: str(), age: num() }));
    expect(validator.judge({})).toEqual({});
  });

  it('should accept partial objects with some properties', () => {
    const validator = partial(obj({ name: str(), age: num(), active: bool() }));

    expect(validator.judge({ name: 'Alice' })).toEqual({ name: 'Alice' });
    expect(validator.judge({ age: 30 })).toEqual({ age: 30 });
    expect(validator.judge({ name: 'Bob', active: true })).toEqual({
      name: 'Bob',
      active: true,
    });
  });

  it('should accept full objects with all properties', () => {
    const validator = partial(obj({ name: str(), age: num() }));

    expect(validator.judge({ name: 'Charlie', age: 25 })).toEqual({
      name: 'Charlie',
      age: 25,
    });
  });

  it('should reject invalid property types', () => {
    const validator = partial(obj({ name: str(), age: num() }));

    expect(() => validator.judge({ name: 123 })).toThrow(/number.*expected string/);
    expect(() => validator.judge({ age: 'invalid' })).toThrow(/string.*expected number/);
    expect(() => validator.judge({ name: 'Valid', age: 'invalid' })).toThrow(
      /string.*expected number/
    );
  });

  it('should reject non-object values', () => {
    const validator = partial(obj({ name: str() }));

    expect(() => validator.judge('hello')).toThrow(/string.*expected object/);
    expect(() => validator.judge(null)).toThrow(/null.*expected object/);
    expect(() => validator.judge(undefined)).toThrow(/undefined.*expected object/);
    expect(() => validator.judge([])).toThrow(/array.*expected object/);
  });

  it('should work with nested objects', () => {
    const validator = partial(
      obj({
        name: str(),
        address: obj({
          street: str(),
          city: str(),
        }),
      })
    );

    expect(validator.judge({})).toEqual({});
    expect(validator.judge({ name: 'Alice' })).toEqual({ name: 'Alice' });
    expect(
      validator.judge({
        address: { street: '123 Main St', city: 'NYC' },
      })
    ).toEqual({
      address: { street: '123 Main St', city: 'NYC' },
    });
    expect(
      validator.judge({
        name: 'Bob',
        address: { street: '456 Oak Ave', city: 'LA' },
      })
    ).toEqual({
      name: 'Bob',
      address: { street: '456 Oak Ave', city: 'LA' },
    });
  });

  it('should work with nested partial objects', () => {
    const validator = partial(
      obj({
        name: str(),
        address: partial(
          obj({
            street: str(),
            city: str(),
          })
        ),
      })
    );

    expect(validator.judge({})).toEqual({});
    expect(validator.judge({ address: {} })).toEqual({ address: {} });
    expect(validator.judge({ address: { street: '123 Main St' } })).toEqual({
      address: { street: '123 Main St' },
    });
  });

  it('should allow undefined values for properties', () => {
    const validator = partial(obj({ name: str(), age: num() }));

    // Undefined values are allowed and simply not included in result
    expect(validator.judge({ name: 'Alice', age: undefined })).toEqual({ name: 'Alice' });
    expect(validator.judge({ name: undefined })).toEqual({});
  });

  it('should ignore extra properties not in schema', () => {
    const validator = partial(obj({ name: str() }));
    const result = validator.judge({ name: 'Alice', extra: 'ignored', another: 123 });

    expect(result).toEqual({ name: 'Alice' });
    expect(result).not.toHaveProperty('extra');
    expect(result).not.toHaveProperty('another');
  });

  describe('tryJudge', () => {
    it('should return success for empty object', () => {
      const validator = partial(obj({ name: str(), age: num() }));
      const result = validator.tryJudge({});

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toEqual({});
      }
    });

    it('should return success for partial object', () => {
      const validator = partial(obj({ name: str(), age: num() }));
      const result = validator.tryJudge({ name: 'Alice' });

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toEqual({ name: 'Alice' });
      }
    });

    it('should return error for invalid property types', () => {
      const validator = partial(obj({ name: str(), age: num() }));
      const result = validator.tryJudge({ name: 123, age: 'invalid' });

      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.issues).toHaveLength(2);
        const paths = result.issues.map((i: { path: string }) => i.path).sort();
        expect(paths).toEqual(['age', 'name']);
      }
    });

    it('should include correct paths for nested objects', () => {
      const validator = partial(
        obj({
          user: obj({ name: str(), age: num() }),
        })
      );

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

  describe('type inference', () => {
    it('should infer Partial<T> type', () => {
      const validator = partial(
        obj({
          name: str(),
          age: num(),
          active: bool(),
        })
      );

      // This is a type-level test that will fail at compile time if wrong
      type Expected = Partial<{ name: string; age: number; active: boolean }>;
      type Actual = ReturnType<typeof validator.judge>;

      const _typeCheck: Expected = {} as Actual;
      const _reverseTypeCheck: Actual = {} as Expected;

      // Suppress unused variable warnings
      expect(_typeCheck).toBeDefined();
      expect(_reverseTypeCheck).toBeDefined();
    });
  });
});
