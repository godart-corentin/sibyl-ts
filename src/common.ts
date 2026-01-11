import { JudgmentIssue } from './error';

export type JudgmentResult<T> =
  | {
      type: 'success';
      data: T;
    }
  | {
      type: 'error';
      issues: JudgmentIssue[];
    };

export type Validator<T = unknown> = {
  judge: (value: unknown) => T;
  tryJudge: (value: unknown) => JudgmentResult<T>;
};

export type ExtractValidatorType<V> = V extends Validator<infer T> ? T : never;
