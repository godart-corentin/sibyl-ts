import { describe, expect, it } from 'vitest';
import { ip } from './ip';

describe.concurrent('IP validator', () => {
  it('should validate IPv4 addresses', () => {
    expect(ip().judge('192.168.0.1')).toBe('192.168.0.1');
    expect(ip().judge('127.0.0.1')).toBe('127.0.0.1');
    expect(ip().judge('0.0.0.0')).toBe('0.0.0.0');
    expect(ip().judge('255.255.255.255')).toBe('255.255.255.255');
  });

  it('should validate IPv6 addresses', () => {
    expect(ip().judge('::1')).toBe('::1');
    expect(ip().judge('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(
      '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
    );
    expect(ip().judge('fe80::1ff:fe23:4567:890a')).toBe('fe80::1ff:fe23:4567:890a');
  });

  it('should fail for invalid IPs', () => {
    expect(() => ip().judge('256.256.256.256')).toThrow('Invalid IP address');
    expect(() => ip().judge('192.168.1')).toThrow('Invalid IP address'); // incomplete
    expect(() => ip().judge('192.168.1.1.1')).toThrow('Invalid IP address'); // too long
    expect(() => ip().judge('abc.def.ghi.jkl')).toThrow('Invalid IP address');
    expect(() => ip().judge('1234:::')).toThrow('Invalid IP address');
  });

  it('should fail for non-string values', () => {
    expect(() => ip().judge(123)).toThrow(/number.*expected string/);
  });

  it('should strict validation on version 4', () => {
    const validator = ip({ version: '4' });
    expect(validator.judge('192.168.0.1')).toBe('192.168.0.1');
    expect(() => validator.judge('::1')).toThrow('Invalid IPv4 address');
  });

  it('should strict validation on version 6', () => {
    const validator = ip({ version: '6' });
    expect(validator.judge('::1')).toBe('::1');
    expect(() => validator.judge('192.168.0.1')).toThrow('Invalid IPv6 address');
  });
});
