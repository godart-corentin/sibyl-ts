import type { Validator } from '../common';
import { withTryJudge } from '../withTryJudge';
import { JudgmentError, type JudgmentIssue } from '../error';
import { getValueType } from '../getValueType';

// Extract tuple type from array of validators
export const tuple = <T extends [unknown, unknown, ...unknown[]]>(validators: {
  [K in keyof T]: Validator<T[K]>;
}): Validator<T> => {
  return withTryJudge({
    judge(value): T {
      if (!Array.isArray(value)) {
        const valueType = getValueType(value);
        throw new JudgmentError([
          {
            message: `Value is ${valueType}, expected array`,
            path: '',
          },
        ]);
      }

      if (value.length !== validators.length) {
        throw new JudgmentError([
          { message: `Expected ${validators.length} elements, got ${value.length}`, path: '' },
        ]);
      }

      const { result, issues } = validators.reduce<{
        result: T[number][];
        issues: JudgmentIssue[];
      }>(
        (acc, validator, index) => {
          try {
            return {
              ...acc,
              result: [...acc.result, validator.judge(value[index])],
            };
          } catch (error) {
            if (error instanceof JudgmentError) {
              // Prepend the tuple index to all issues
              const issuesWithPath = error.issues.map((issue) => ({
                message: issue.message,
                path: issue.path
                  ? issue.path.startsWith('[')
                    ? `[${index}]${issue.path}`
                    : `[${index}].${issue.path}`
                  : `[${index}]`,
              }));
              return {
                ...acc,
                issues: [...acc.issues, ...issuesWithPath],
              };
            } else {
              // Non-validation error, re-throw
              throw error;
            }
          }
        },
        { result: [], issues: [] }
      );

      if (issues.length > 0) {
        throw new JudgmentError(issues);
      }

      return result as T;
    },
  });
};
