import type { Validator } from '../common';
import { withTryJudge } from '../withTryJudge';
import { JudgmentError } from '../error';
import { getValueType } from '../getValueType';

// Extract union type from array of validators
export const union = <T extends [unknown, unknown, ...unknown[]]>(validators: {
  [K in keyof T]: Validator<T[K]>;
}): Validator<T[number]> => {
  return withTryJudge({
    judge(value): T[number] {
      for (const validator of validators) {
        try {
          return validator.judge(value);
        } catch (error) {
          continue;
        }
      }

      const valueType = getValueType(value);
      throw new JudgmentError([
        { message: `Value is ${valueType}, expected one of the union values`, path: '' },
      ]);
    },
  });
};
