import type { Validator } from '../common';
import { withTryJudge } from '../withTryJudge';
import { JudgmentError } from '../error';
import { getValueType } from '../getValueType';

type BooleanOptions = {
  coerce?: boolean;
};

type BooleanValidator = Validator<boolean>;

const coerceBoolean = (value: unknown): boolean => {
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return Boolean(value);
};

export const bool = (opts?: BooleanOptions): BooleanValidator => {
  return withTryJudge({
    judge(value): boolean {
      const val = opts?.coerce ? coerceBoolean(value) : value;

      if (typeof val !== 'boolean') {
        const valueType = getValueType(val);
        throw new JudgmentError([
          {
            message: `Value is ${valueType}, expected boolean`,
            path: '',
          },
        ]);
      }

      return val;
    },
  });
};
