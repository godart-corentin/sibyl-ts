import { Validator } from '../common';
import { withTryJudge } from '../withTryJudge';
import { JudgmentError } from '../error';
import { getValueType } from '../getValueType';

type EnumValidator<T> = Validator<T>;

export const nativeEnum = <T extends Record<string, string | number>>(
  enumObj: T
): EnumValidator<T[keyof T]> => {
  const values = Object.values(enumObj) as Array<T[keyof T]>;
  return withTryJudge({
    judge(value): T[keyof T] {
      const val = values.find((v) => v === value);

      if (val === undefined) {
        const valueType = getValueType(value);
        throw new JudgmentError([
          {
            message: `Value is ${valueType}, expected value from enum`,
            path: '',
          },
        ]);
      }

      return val;
    },
  });
};
