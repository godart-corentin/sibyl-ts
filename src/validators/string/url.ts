import type { Validator } from '../../common';
import { withTryJudge } from '../../withTryJudge';
import { JudgmentError } from '../../error';
import { getValueType } from '../../getValueType';

export const url = (): Validator<string> => {
  return withTryJudge({
    judge(value): string {
      if (typeof value !== 'string') {
        const valueType = getValueType(value);
        throw new JudgmentError([{ message: `Value is ${valueType}, expected string`, path: '' }]);
      }

      try {
        new URL(value);
        return value;
      } catch {
        throw new JudgmentError([{ message: 'Invalid URL', path: '' }]);
      }
    },
  });
};
