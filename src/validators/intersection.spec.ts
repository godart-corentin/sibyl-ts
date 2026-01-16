import { describe, it, expect } from 'vitest';
import { intersection } from './intersection';
import { obj } from './object';
import { str } from './string';
import { num } from './number';
import { lit as literal } from './literal';

describe('intersection validator', () => {
  it('should validate intersection of disjoint objects', () => {
    const schema = intersection([obj({ a: str() }), obj({ b: num() })]);

    const result = schema.judge({ a: 'foo', b: 42 });
    expect(result).toEqual({ a: 'foo', b: 42 });
  });

  it('should validate intersection with overlapping merging', () => {
    // conceptually A & B where keys overlap deeply
    const schema = intersection([
      obj({ nested: obj({ x: num() }) }),
      obj({ nested: obj({ y: str() }) }),
    ]);

    const result = schema.judge({ nested: { x: 1, y: 'a' } });
    expect(result).toEqual({ nested: { x: 1, y: 'a' } });
  });

  it('should fail if one validator fails', () => {
    const schema = intersection([obj({ a: str() }), obj({ b: num() })]);

    expect(() => schema.judge({ a: 'foo', b: 'invalid' })).toThrow();
  });

  it('should collect errors from multiple failures', () => {
    const schema = intersection([obj({ a: str() }), obj({ b: num() })]);

    try {
      schema.judge({ a: 123, b: 'invalid' });
    } catch (e: any) {
      expect(e.issues.length).toBeGreaterThan(0);
    }
  });

  it('should work with intersection of simpler types (refinement-like)', () => {
    // This is a bit unusual for intersection, but technically valid in TS:
    // string & "foo" -> "foo"
    const schema = intersection([str(), literal('foo')]);

    expect(schema.judge('foo')).toBe('foo');
    expect(() => schema.judge('bar')).toThrow();
  });
});
