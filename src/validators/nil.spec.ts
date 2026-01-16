import { describe, it, expect } from 'vitest';
import { nil } from './nil';

describe.concurrent('Null validator', () => {
    it('should validate null', () => {
        expect(nil().judge(null)).toBeNull();
    });

    it('should throw error for non-null values', () => {
        expect(() => nil().judge(undefined)).toThrow('Value is undefined, expected null');
        expect(() => nil().judge(0)).toThrow('Value is number, expected null');
        expect(() => nil().judge(false)).toThrow('Value is boolean, expected null');
        expect(() => nil().judge('')).toThrow('Value is string, expected null');
        expect(() => nil().judge([])).toThrow('Value is array, expected null');
        expect(() => nil().judge({})).toThrow('Value is object, expected null');
    });
});
