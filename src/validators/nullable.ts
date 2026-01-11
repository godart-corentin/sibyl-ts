import { type Validator } from '../common';
import { withTryJudge } from '../withTryJudge';

export const nullable = <T>(validator: Validator<T>): Validator<T | null> => {
  return withTryJudge({
    judge(value): T | null {
      if (value === null) {
        return null;
      }
      return validator.judge(value);
    },
  });
};
