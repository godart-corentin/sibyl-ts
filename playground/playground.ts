import { str, num, obj, email, arr, optional } from 'sibyl-ts';

console.log('🎭 Sibyl-TS Playground\n');

const inspectorValidator = obj({
  name: str({ minLen: 2, maxLen: 50 }),
  crimeCoefficient: num({ min: 0, max: 300 }),
  email: email(),
  division: str(),
  enforcers: optional(arr(str())),
});

console.log(
  inspectorValidator.tryJudge({
    name: 'Akane Tsunemori',
    crimeCoefficient: 28,
    email: 'akane@mwpsb.go.jp',
    division: 'Unit 1',
  })
);
