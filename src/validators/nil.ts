import { JudgmentError } from '../error';
import { Validator } from '../common';
import { getValueType } from '../getValueType';
import { withTryJudge } from '../withTryJudge';

export const nil = (): Validator<null> => {
  return withTryJudge({
    judge(value): null {
      if (value === null) {
        return null;
      }

      const valueType = getValueType(value);
      throw new JudgmentError([
        {
          message: `Value is ${valueType}, expected null`,
          path: '',
        },
      ]);
    },
  });
};
