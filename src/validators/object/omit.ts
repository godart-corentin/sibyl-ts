import { Validator } from '../../common';
import { JudgmentError } from '../../error';
import { getValueType } from '../../getValueType';
import { withTryJudge } from '../../withTryJudge';

type ArrToLiteral<T extends readonly unknown[]> = T[number];

export const omit = <T extends Record<string, unknown>, K extends readonly (keyof T)[]>(
  validator: Validator<T>,
  keys: K
): Validator<Omit<T, ArrToLiteral<K>>> => {
  const keysSet = new Set(keys as readonly string[]);

  return withTryJudge({
    judge(value): Omit<T, ArrToLiteral<K>> {
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
        // Functional approach: filter entries and rebuild object (O(n) performance)
        const filtered = Object.fromEntries(
          Object.entries(result.data).filter(([key]) => !keysSet.has(key))
        );
        return filtered as Omit<T, ArrToLiteral<K>>;
      }

      // Filter out errors for omitted keys
      const nonOmittedErrors = result.issues.filter((issue) => {
        // Extract the root key from the path (e.g., "user.name" -> "user", "age" -> "age")
        const rootKey = issue.path.split('.')[0].split('[')[0];
        return !keysSet.has(rootKey);
      });

      if (nonOmittedErrors.length > 0) {
        throw new JudgmentError(nonOmittedErrors);
      }

      // All errors were for omitted keys, so filter those out and return
      const filtered = Object.fromEntries(
        Object.entries(value).filter(([key]) => !keysSet.has(key))
      );
      return filtered as Omit<T, ArrToLiteral<K>>;
    },
  });
};
