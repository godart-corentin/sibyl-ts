import type { Validator } from '../common';
import { withTryJudge } from '../withTryJudge';
import { JudgmentError } from '../error';
import { getValueType } from '../getValueType';

type NumberOptions = {
  min?: number;
  max?: number;
  coerce?: boolean;
};

const coerceNumber = (value: unknown): number => {
  const coerced = Number(value);
  if (Number.isNaN(coerced)) {
    throw new JudgmentError([{ message: 'Value cannot be coerced to a number', path: '' }]);
  }
  return coerced;
};

export const num = (opts?: NumberOptions): Validator<number> => {
  return withTryJudge({
    judge(value): number {
      const val = opts?.coerce ? coerceNumber(value) : value;

      if (typeof val !== 'number') {
        const valueType = getValueType(val);
        throw new JudgmentError([
          {
            message: `Value is ${valueType}, expected number`,
            path: '',
          },
        ]);
      }

      if (opts?.min && val < opts.min) {
        throw new JudgmentError([
          { message: `Value is too small, expected at least ${opts.min}`, path: '' },
        ]);
      }

      if (opts?.max && val > opts.max) {
        throw new JudgmentError([
          { message: `Value is too big, expected at most ${opts.max}`, path: '' },
        ]);
      }

      return val;
    },
  });
};
