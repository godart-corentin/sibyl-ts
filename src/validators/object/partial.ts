import type { Validator } from '../../common';
import { withTryJudge } from '../../withTryJudge';
import { JudgmentError } from '../../error';
import { getValueType } from '../../getValueType';

export const partial = <T extends Record<string, unknown>>(
  validator: Validator<T>
): Validator<Partial<T>> => {
  return withTryJudge({
    judge(value): Partial<T> {
      if (
        value === null ||
        value === undefined ||
        typeof value !== 'object' ||
        Array.isArray(value) ||
        value instanceof Date
      ) {
        const valueType = getValueType(value);
        throw new JudgmentError([
          {
            message: `Value is ${valueType}, expected object`,
            path: '',
          },
        ]);
      }

      const result = validator.tryJudge(value);

      if (result.type === 'success') {
        return result.data;
      }

      const nonUndefinedErrors = result.issues.filter((issue) => {
        return !issue.message.includes('Value is undefined');
      });

      if (nonUndefinedErrors.length > 0) {
        throw new JudgmentError(nonUndefinedErrors);
      }

      return value as Partial<T>;
    },
  });
};
