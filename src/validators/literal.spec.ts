import { describe, expect, it } from 'vitest';
import { lit } from './literal';

describe.concurrent('Literal validator', () => {
  it('should throw an error if the value is not the literal', () => {
    expect(() => lit('a').judge('b')).toThrow(/string.*expected literal/);
    expect(() => lit(3).judge(4)).toThrow(/number.*expected literal/);
    expect(() => lit(true).judge(false)).toThrow(/boolean.*expected literal/);
  });

  it('should return the value if it is the literal', () => {
    expect(lit('a').judge('a')).toBe('a');
    expect(lit(3).judge(3)).toBe(3);
    expect(lit(true).judge(true)).toBe(true);
    expect(lit(null).judge(null)).toBe(null);
    expect(lit(undefined).judge(undefined)).toBe(undefined);
  });

  it('should use strict equality (no type coercion)', () => {
    expect(() => lit(0).judge(false)).toThrow(/boolean.*expected literal/);
    expect(() => lit(1).judge(true)).toThrow(/boolean.*expected literal/);
    expect(() => lit('').judge(false)).toThrow(/boolean.*expected literal/);
    expect(() => lit('0').judge(0)).toThrow(/number.*expected literal/);
  });

  it('should work with edge case values', () => {
    expect(lit(0).judge(0)).toBe(0);
    expect(lit(-1).judge(-1)).toBe(-1);
    expect(lit('').judge('')).toBe('');
    expect(lit(false).judge(false)).toBe(false);
  });

  it('should reject undefined and null', () => {
    expect(() => lit('test').judge(null)).toThrow(/null.*expected literal/);
    expect(() => lit('test').judge(undefined)).toThrow(/undefined.*expected literal/);
    expect(() => lit(5).judge(null)).toThrow(/null.*expected literal/);
  });

  it('should work with special number values', () => {
    expect(lit(Infinity).judge(Infinity)).toBe(Infinity);
    expect(lit(-Infinity).judge(-Infinity)).toBe(-Infinity);
    // Note: NaN can't work with literal validator because NaN !== NaN
  });

  describe('safeParse', () => {
    it('should return success for matching literal', () => {
      const result = lit('hello').tryJudge('hello');
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toBe('hello');
      }
    });

    it('should return error for non-matching literal', () => {
      const result = lit(42).tryJudge(43);
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.issues[0].message).toMatch(/number.*expected literal/);
      }
    });
  });
});
