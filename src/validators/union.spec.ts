import { describe, expect, it } from 'vitest';
import { union } from './union';
import { str } from './string';
import { num } from './number';
import { bool } from './boolean';
import { lit } from './literal';

describe.concurrent('Union validator', () => {
  it('should throw an error if the value is not a string or number', () => {
    expect(() => union([str(), num()]).judge(true)).toThrow(
      /boolean.*expected one of the union values/
    );
  });

  it('should throw an error if the value is not valid for any of the validators', () => {
    expect(() =>
      union([str({ pattern: 'hello' }), str({ pattern: 'world' })]).judge('1234')
    ).toThrow(/string.*expected one of the union values/);
  });

  it('should return the value if it is valid', () => {
    expect(union([str(), num()]).judge('1234')).toBe('1234');
    expect(union([str(), num()]).judge(1234)).toBe(1234);
    expect(union([str({ pattern: 'hello' }), str({ pattern: 'world' })]).judge('hello')).toBe(
      'hello'
    );
  });

  it('should validate in order and return on first match', () => {
    const validator = union([str(), num()]);
    expect(validator.judge('123')).toBe('123'); // Matches str first
    expect(validator.judge(123)).toBe(123); // Then tries num
  });

  it('should work with multiple types', () => {
    const validator = union([str(), num(), bool()]);
    expect(validator.judge('hello')).toBe('hello');
    expect(validator.judge(42)).toBe(42);
    expect(validator.judge(true)).toBe(true);
    expect(() => validator.judge(null)).toThrow(/null.*expected one of the union values/);
  });

  it('should work with literal validators in union', () => {
    const status = union([lit('pending'), lit('approved'), lit('rejected')]);
    expect(status.judge('pending')).toBe('pending');
    expect(status.judge('approved')).toBe('approved');
    expect(() => status.judge('unknown')).toThrow(
      /string.*expected one of the union values/
    );
  });

  it('should work with coercion in union members', () => {
    const validator = union([str({ coerce: true }), num({ coerce: true })]);
    expect(validator.judge('hello')).toBe('hello');
    expect(validator.judge(123)).toBe('123'); // Coerced to string by first validator
    expect(validator.judge(true)).toBe('true'); // Coerced to string by first validator
  });

  it('should handle edge values', () => {
    const validator = union([str(), num(), bool()]);
    expect(validator.judge('')).toBe('');
    expect(validator.judge(0)).toBe(0);
    expect(validator.judge(false)).toBe(false);
    expect(validator.judge(NaN)).toBe(NaN);
  });

  describe('safeParse', () => {
    it('should return success when union matches', () => {
      const result = union([str(), num()]).tryJudge('hello');
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toBe('hello');
      }
    });

    it('should return error when none match', () => {
      const result = union([str(), num()]).tryJudge(true);
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.issues[0].message).toMatch(
          /boolean.*expected one of the union values/
        );
      }
    });
  });
});
