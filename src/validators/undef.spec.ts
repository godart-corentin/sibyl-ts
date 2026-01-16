import { describe, it, expect } from 'vitest';
import { undef } from './undef';

describe.concurrent('Undefined validator', () => {
    it('should validate undefined', () => {
        expect(undef().judge(undefined)).toBeUndefined();
    });

    it('should throw error for non-undefined values', () => {
        expect(() => undef().judge(null)).toThrow(/null.*expected undefined/);
        expect(() => undef().judge(0)).toThrow(/number.*expected undefined/);
        expect(() => undef().judge(false)).toThrow(/boolean.*expected undefined/);
        expect(() => undef().judge('')).toThrow(/string.*expected undefined/);
        expect(() => undef().judge([])).toThrow(/array.*expected undefined/);
        expect(() => undef().judge({})).toThrow(/object.*expected undefined/);
    });
});