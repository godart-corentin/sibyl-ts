import type { Validator } from '../common';
import { withTryJudge } from '../withTryJudge';
import { JudgmentError, type JudgmentIssue } from '../error';
import { getValueType } from '../getValueType';

type ArrayOptions = {
  minLen?: number;
  maxLen?: number;
};

export const arr = <T>(arrayValidator: Validator<T>, opts?: ArrayOptions): Validator<T[]> => {
  return withTryJudge({
    judge(value): T[] {
      if (!Array.isArray(value)) {
        const valueType = getValueType(value);
        throw new JudgmentError([
          {
            message: `Value is ${valueType}, expected array`,
            path: '',
          },
        ]);
      }

      if (opts?.minLen && value.length < opts.minLen) {
        throw new JudgmentError([
          { message: `Value is too short, expected at least ${opts.minLen} elements`, path: '' },
        ]);
      }

      if (opts?.maxLen && value.length > opts.maxLen) {
        throw new JudgmentError([
          { message: `Value is too long, expected at most ${opts.maxLen} elements`, path: '' },
        ]);
      }

      const { result, issues } = value.reduce<{ result: T[]; issues: JudgmentIssue[] }>(
        (acc, item, index) => {
          try {
            return {
              ...acc,
              result: [...acc.result, arrayValidator.judge(item)],
            };
          } catch (error) {
            if (error instanceof JudgmentError) {
              // Prepend the array index to all issues
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

      return result;
    },
  });
};
