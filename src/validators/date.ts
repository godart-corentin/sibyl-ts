import { withTryJudge } from '../withTryJudge';
import { Validator } from '../common';
import { getValueType } from '../getValueType';
import { JudgmentError } from '../error';

type DateOptions = {
  min?: Date;
  max?: Date;
};

type DateValidator = Validator<Date>;

export const date = (opts?: DateOptions): DateValidator => {
  return withTryJudge({
    judge(value): Date {
      if (typeof value !== 'string' && !(value instanceof Date)) {
        const valueType = getValueType(value);
        throw new JudgmentError([
          {
            message: `Value is ${valueType}, expected string or Date`,
            path: '',
          },
        ]);
      }

      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new JudgmentError([
          {
            message: 'Invalid date',
            path: '',
          },
        ]);
      }

      if (opts?.min && date < opts.min) {
        throw new JudgmentError([
          {
            message: `Date is before ${opts.min.toISOString()}`,
            path: '',
          },
        ]);
      }

      if (opts?.max && date > opts.max) {
        throw new JudgmentError([
          {
            message: `Date is after ${opts.max.toISOString()}`,
            path: '',
          },
        ]);
      }
      return date;
    },
  });
};
