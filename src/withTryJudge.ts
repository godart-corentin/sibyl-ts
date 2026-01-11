import { JudgmentResult, Validator } from './common';
import { JudgmentError } from './error';

export function withTryJudge<T>(validator: { judge: (value: unknown) => T }): Validator<T> {
  return {
    judge: validator.judge.bind(validator),
    tryJudge(value: unknown): JudgmentResult<T> {
      try {
        return {
          type: 'success',
          data: validator.judge(value),
        };
      } catch (error) {
        if (error instanceof JudgmentError) {
          return {
            type: 'error',
            issues: error.issues,
          };
        }
        throw error;
      }
    },
  };
}
