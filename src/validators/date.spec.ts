import { describe, expect, it } from 'vitest';
import { date } from './date';

describe.concurrent('Date validator', () => {
  it('should validate a valid string date', () => {
    const validator = date();
    const result = validator.judge('2022-01-01');
    expect(result).toBeInstanceOf(Date);
  });

  it('should validate a valid Date object', () => {
    const validator = date();
    const result = validator.judge(new Date());
    expect(result).toBeInstanceOf(Date);
  });

  it('should throw an error for an invalid date', () => {
    const validator = date();
    expect(() => validator.judge('invalid date')).toThrow('Invalid date');
  });

  it('should throw an error for a date before min', () => {
    const validator = date({ min: new Date() });
    expect(() => validator.judge(new Date(Date.now() - 1000))).toThrow('Date is before');
  });

  it('should throw an error for a date after max', () => {
    const validator = date({ max: new Date() });
    expect(() => validator.judge(new Date(Date.now() + 1000))).toThrow('Date is after');
  });
});
