import { describe, expect, it } from 'vitest';
import { nativeEnum } from './enum';

enum TestEnum {
  A = 'A',
  B = 'B',
  C = 'C',
}

describe.concurrent('Enum validator', () => {
  it('should throw an error if the value is not in the enum', () => {
    const validator = nativeEnum(TestEnum);
    expect(() => validator.judge('D')).toThrow(/string.*expected value from enum/);
    // But if we pass a different type
    expect(() => validator.judge(123)).toThrow(/number.*expected value from enum/);
    expect(() => validator.judge(null)).toThrow(/null.*expected value from enum/);
    expect(() => validator.judge(undefined)).toThrow(
      /undefined.*expected value from enum/
    );
  });

  it('should return the value if it is in the enum', () => {
    const validator = nativeEnum(TestEnum);
    expect(validator.judge('A')).toBe(TestEnum.A);
  });

  describe('safeParse', () => {
    it('should return success for valid enum value', () => {
      const result = nativeEnum(TestEnum).tryJudge('A');
      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.data).toBe(TestEnum.A);
      }
    });

    it('should return error for invalid enum value', () => {
      const result = nativeEnum(TestEnum).tryJudge('D');
      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.issues[0].message).toMatch(/string.*expected value from enum/);
      }
    });
  });
});
