import { describe, expect, it } from 'vitest';
import { url } from './url';

describe.concurrent('URL validator', () => {
  it('should validate valid URLs', () => {
    expect(url().judge('https://example.com')).toBe('https://example.com');
    expect(url().judge('http://localhost:3000')).toBe('http://localhost:3000');
    expect(url().judge('mailto:user@example.com')).toBe('mailto:user@example.com');
  });

  it('should fail for invalid URLs', () => {
    expect(() => url().judge('example.com')).toThrow('Invalid URL');
    expect(() => url().judge('https://')).toThrow('Invalid URL');
    expect(() => url().judge('')).toThrow('Invalid URL');
  });

  it('should fail for non-string values', () => {
    expect(() => url().judge(123)).toThrow(/number.*expected string/);
  });
});
