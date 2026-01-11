import type { Validator } from '../common';
import { withTryJudge } from '../withTryJudge';

// Overload signatures for better type inference
export function optional<T>(validator: Validator<T>): Validator<T | undefined>;

export function optional<T>(validator: Validator<T>, defaultValue: T): Validator<T>;

// Implementation
export function optional<T>(validator: Validator<T>, defaultValue?: T): Validator<T | undefined> {
  const hasDefault = arguments.length === 2;

  return withTryJudge({
    judge(value): T | undefined {
      if (value === undefined) {
        return hasDefault ? defaultValue! : undefined;
      }
      return validator.judge(value);
    },
  });
}
