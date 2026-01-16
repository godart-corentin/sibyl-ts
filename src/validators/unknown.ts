import type { Validator } from '../common';
import { withTryJudge } from '../withTryJudge';

export const unknown = (): Validator<unknown> => {
  return withTryJudge({
    judge(value): unknown {
      return value;
    },
  });
};
