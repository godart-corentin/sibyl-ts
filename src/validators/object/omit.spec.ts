import { describe, expect, it } from 'vitest';
import { omit } from './omit';
import { str } from '../string';
import { num } from '../number';
import { bool } from '../boolean';
import { obj } from './object';

describe.concurrent('Omit validator', () => {
  it('should omit single key from object', () => {
    const validator = omit(obj({ key1: str(), key2: str(), key3: num() }), ['key1']);

    expect(validator.judge({ key1: 'omitted', key2: 'hello', key3: 42 })).toEqual({
      key2: 'hello',
      key3: 42,
    });
  });

  it('should omit multiple keys from object', () => {
    const validator = omit(obj({ key1: str(), key2: str(), key3: num() }), ['key1', 'key2']);

    expect(validator.judge({ key1: 'omitted1', key2: 'omitted2', key3: 42 })).toEqual({
      key3: 42,
    });
  });

  it('should omit all keys when all are specified', () => {
    const validator = omit(obj({ key1: str(), key2: str() }), ['key1', 'key2']);

    expect(validator.judge({ key1: 'hello', key2: 'world' })).toEqual({});
  });

  it('should return same object when omitting no keys', () => {
    const validator = omit(obj({ key1: str(), key2: num() }), []);

    expect(validator.judge({ key1: 'hello', key2: 42 })).toEqual({
      key1: 'hello',
      key2: 42,
    });
  });

  it('should work with different property types', () => {
    const validator = omit(obj({ name: str(), age: num(), active: bool(), count: num() }), [
      'age',
      'count',
    ]);

    expect(validator.judge({ name: 'Alice', age: 30, active: true, count: 5 })).toEqual({
      name: 'Alice',
      active: true,
    });
  });

  it('should not validate omitted keys', () => {
    const validator = omit(obj({ key1: str(), key2: num() }), ['key1']);

    // key1 can be any invalid value since it's omitted
    expect(validator.judge({ key1: 999, key2: 42 })).toEqual({ key2: 42 });
    expect(validator.judge({ key1: null, key2: 42 })).toEqual({ key2: 42 });
    expect(validator.judge({ key1: [], key2: 42 })).toEqual({ key2: 42 });
  });

  it('should work with nested objects', () => {
    const validator = omit(
      obj({
        name: str(),
        age: num(),
        address: obj({
          street: str(),
          city: str(),
        }),
      }),
      ['age']
    );

    expect(
      validator.judge({
        name: 'Alice',
        age: 30,
        address: { street: '123 Main St', city: 'NYC' },
      })
    ).toEqual({
      name: 'Alice',
      address: { street: '123 Main St', city: 'NYC' },
    });
  });

  it('should work with nested omit validators', () => {
    const validator = omit(
      obj({
        name: str(),
        user: omit(obj({ id: num(), email: str(), password: str() }), ['password']),
      }),
      []
    );

    expect(
      validator.judge({
        name: 'Alice',
        user: { id: 1, email: 'alice@example.com', password: 'secret123' },
      })
    ).toEqual({
      name: 'Alice',
      user: { id: 1, email: 'alice@example.com' },
    });
  });
});
