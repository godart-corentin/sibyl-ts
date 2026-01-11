import type { Validator } from '../common';
import { withTryJudge } from '../withTryJudge';
import { JudgmentError, type JudgmentIssue } from '../error';
import { getValueType } from '../getValueType';

// Extract the parsed object type from a schema
export type InferObjectType<Schema extends Record<string, Validator>> = {
  [K in keyof Schema]: Schema[K] extends Validator<infer T> ? T : never;
};

export const obj = <T extends Record<string, unknown>>(schema: {
  [K in keyof T]: Validator<T[K]>;
}): Validator<T> => {
  return withTryJudge({
    judge(value): T {
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

      const { result, issues } = Object.entries(schema).reduce<{
        result: Partial<T>;
        issues: JudgmentIssue[];
      }>(
        (acc, [key, validator]) => {
          const inputValue = value[key as keyof typeof value];

          try {
            const parsedValue = validator.judge(inputValue);
            return {
              ...acc,
              result: { ...acc.result, [key]: parsedValue },
            };
          } catch (error) {
            if (error instanceof JudgmentError) {
              const issuesWithPath = error.issues.map((issue) => ({
                message: issue.message,
                path: issue.path
                  ? issue.path.startsWith('[')
                    ? `${key}${issue.path}`
                    : `${key}.${issue.path}`
                  : key,
              }));
              return {
                ...acc,
                issues: [...acc.issues, ...issuesWithPath],
              };
            } else {
              throw error;
            }
          }
        },
        { result: {}, issues: [] }
      );

      if (issues.length > 0) {
        throw new JudgmentError(issues);
      }

      return result as T;
    },
  });
};
