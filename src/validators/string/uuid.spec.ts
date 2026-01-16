import { describe, expect, it } from 'vitest';
import { uuid } from './uuid';

describe.concurrent('UUID validator', () => {
  it('should validate valid UUIDs', () => {
    expect(uuid().judge('123e4567-e89b-12d3-a456-426614174000')).toBe(
      '123e4567-e89b-12d3-a456-426614174000'
    );
    expect(uuid().judge('00000000-0000-0000-0000-000000000000')).toBe(
      '00000000-0000-0000-0000-000000000000'
    );
  });

  it('should validate UUIDs regardless of case', () => {
    expect(uuid().judge('123E4567-E89B-12D3-A456-426614174000')).toBe(
      '123E4567-E89B-12D3-A456-426614174000'
    );
  });

  it('should fail for invalid UUIDs', () => {
    expect(() => uuid().judge('123e4567-e89b-12d3-a456-42661417400')).toThrow('Invalid UUID'); // Too short
    expect(() => uuid().judge('123e4567-e89b-12d3-a456-4266141740000')).toThrow('Invalid UUID'); // Too long
    expect(() => uuid().judge('123e4567e89b12d3a456426614174000')).toThrow('Invalid UUID'); // Missing dashes
    expect(() => uuid().judge('g23e4567-e89b-12d3-a456-426614174000')).toThrow('Invalid UUID'); // Invalid char
  });

  it('should fail for non-string values', () => {
    expect(() => uuid().judge(123)).toThrow(/number.*expected string/);
  });
});
