import type { Validator } from '../common';
import { withTryJudge } from '../withTryJudge';
import { JudgmentError } from '../error';
import { getValueType } from '../getValueType';

type LiteralType = string | number | boolean | null | undefined;

type LiteralValidator<T extends LiteralType> = Validator<T>;

export const lit = <T extends LiteralType>(literal: T): LiteralValidator<T> => {
  return withTryJudge({
    judge(value): T {
      if (value !== literal) {
        const valueType = getValueType(value);
        throw new JudgmentError([
          {
            message: `Value is ${valueType}, expected literal`,
            path: '',
          },
        ]);
      }

      return literal;
    },
  });
};
