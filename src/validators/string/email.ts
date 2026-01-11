import type { Validator } from '../../common';
import { withTryJudge } from '../../withTryJudge';
import { JudgmentError } from '../../error';
import { getValueType } from '../../getValueType';

export const email = (): Validator<string> => {
  return withTryJudge({
    judge(value): string {
      if (typeof value !== 'string') {
        const valueType = getValueType(value);
        throw new JudgmentError([
          { message: `Value is ${valueType}, expected string`, path: '' },
        ]);
      }

      // Simple, robust Email regex (requires TLD)
      const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

      if (!emailRegex.test(value)) {
        throw new JudgmentError([{ message: 'Invalid email address', path: '' }]);
      }

      return value;
    },
  });
};
