import { describe, it, expect } from 'vitest';
import { nil } from './nil';

describe.concurrent('Null validator', () => {
  it('should validate null', () => {
    expect(nil().judge(null)).toBeNull();
  });

  it('should throw error for non-null values', () => {
    expect(() => nil().judge(undefined)).toThrow(/undefined.*expected null/);
    expect(() => nil().judge(0)).toThrow(/number.*expected null/);
    expect(() => nil().judge(false)).toThrow(/boolean.*expected null/);
    expect(() => nil().judge('')).toThrow(/string.*expected null/);
    expect(() => nil().judge([])).toThrow(/array.*expected null/);
    expect(() => nil().judge({})).toThrow(/object.*expected null/);
  });
});
