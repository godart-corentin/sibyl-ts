import { describe, it, expect } from 'vitest';
import { undef } from './undef';

describe.concurrent('Undefined validator', () => {
    it('should validate undefined', () => {
        expect(undef().judge(undefined)).toBeUndefined();
    });

    it('should throw error for non-undefined values', () => {
        expect(() => undef().judge(null)).toThrow('Value is null, expected undefined');
        expect(() => undef().judge(0)).toThrow('Value is number, expected undefined');
        expect(() => undef().judge(false)).toThrow('Value is boolean, expected undefined');
        expect(() => undef().judge('')).toThrow('Value is string, expected undefined');
        expect(() => undef().judge([])).toThrow('Value is array, expected undefined');
        expect(() => undef().judge({})).toThrow('Value is object, expected undefined');
    });
});