import type { Validator } from '../../common';
import { withTryJudge } from '../../withTryJudge';
import { JudgmentError } from '../../error';
import { getValueType } from '../../getValueType';

export const uuid = (): Validator<string> => {
  return withTryJudge({
    judge(value): string {
      if (typeof value !== 'string') {
        const valueType = getValueType(value);
        throw new JudgmentError([
          { message: `Value is ${valueType}, expected string`, path: '' },
        ]);
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(value)) {
        throw new JudgmentError([{ message: 'Invalid UUID', path: '' }]);
      }

      return value;
    },
  });
};
