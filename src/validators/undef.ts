import { JudgmentError } from "../error";
import { Validator } from "../common";
import { getValueType } from "../getValueType";
import { withTryJudge } from "../withTryJudge";

export const undef = (): Validator<undefined> => {
    return withTryJudge({
        judge(value): undefined {
            if (value === undefined) {
                return undefined;
            }

            const valueType = getValueType(value);
            throw new JudgmentError([
                {
                    message: `Value is ${valueType}, expected undefined`,
                    path: '',
                }
            ]);
        }
    })
}