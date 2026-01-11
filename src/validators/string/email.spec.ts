import { describe, expect, it } from 'vitest';
import { email } from './email';

describe.concurrent('Email validator', () => {
  it('should validate valid emails', () => {
    expect(email().judge('test@example.com')).toBe('test@example.com');
    expect(email().judge('user.name+tag@example.co.uk')).toBe('user.name+tag@example.co.uk');
  });

  it('should fail for invalid emails', () => {
    expect(() => email().judge('test')).toThrow('Invalid email address');
    expect(() => email().judge('test@')).toThrow('Invalid email address');
    expect(() => email().judge('@example.com')).toThrow('Invalid email address');
    expect(() => email().judge('test@example')).toThrow('Invalid email address');
  });

  it('should fail for non-string values', () => {
    expect(() => email().judge(123)).toThrow('Value is number, expected string');
    expect(() => email().judge(null)).toThrow('Value is null, expected string');
  });
});
