import type { Validator, ExtractValidatorType } from '../common';
import { withTryJudge } from '../withTryJudge';
import { JudgmentError, type JudgmentIssue } from '../error';

// Helper type to convert a union to an intersection
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

const isObject = (item: unknown): item is Record<string, unknown> => {
  return (
    typeof item === 'object' && item !== null && !Array.isArray(item) && !(item instanceof Date)
  );
};

// Helper for deep merging objects
const deepMerge = (target: unknown, source: unknown): unknown => {
  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  return Object.keys(source).reduce(
    (acc, key) => {
      const targetValue = acc[key];
      const sourceValue = source[key];

      if (key in acc) {
        return {
          ...acc,
          [key]: deepMerge(targetValue, sourceValue),
        };
      }
      return {
        ...acc,
        [key]: sourceValue,
      };
    },
    { ...target }
  );
};

// Helper type to simplify the intersection type for better readability (recursive)
export type SimplifyDeep<T> =
  // eslint-disable-next-line @typescript-eslint/ban-types
  T extends Record<string, unknown> ? { [K in keyof T]: SimplifyDeep<T[K]> } & {} : T;

export const intersection = <V extends Validator[]>(
  validators: [...V]
): Validator<SimplifyDeep<UnionToIntersection<ExtractValidatorType<V[number]>>>> => {
  return withTryJudge({
    judge(value): SimplifyDeep<UnionToIntersection<ExtractValidatorType<V[number]>>> {
      const { result, issues } = validators.reduce<{
        result: unknown;
        issues: JudgmentIssue[];
      }>(
        (acc, validator) => {
          try {
            const validValue = validator.judge(value);
            return {
              result: acc.result === undefined ? validValue : deepMerge(acc.result, validValue),
              issues: acc.issues,
            };
          } catch (error) {
            if (error instanceof JudgmentError) {
              return {
                result: acc.result,
                issues: [...acc.issues, ...error.issues],
              };
            }
            throw error;
          }
        },
        { result: undefined, issues: [] }
      );

      if (issues.length > 0) {
        throw new JudgmentError(issues);
      }

      return result as SimplifyDeep<UnionToIntersection<ExtractValidatorType<V[number]>>>;
    },
  });
};
