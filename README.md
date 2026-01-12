# sibyl-ts

[![npm version](https://img.shields.io/npm/v/sibyl-ts.svg)](https://www.npmjs.com/package/sibyl-ts)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

> _A TypeScript validation library inspired by the Sibyl System from Psycho-Pass - precise, unwavering judgment for your data._

## Features

- **Type-safe**: Full TypeScript support with automatic type inference
- **Comprehensive validators**: String, number, boolean, date, array, object, tuple, union, and more
- **String validators**: Email, URL, UUID, IP address validation
- **Safe judgment**: `tryJudge()` method returns results without throwing
- **Detailed errors**: Rich error messages with path information
- **Composable**: Build complex validators from simple ones
- **Dual module support**: Works with both ESM and CommonJS

## Installation

```bash
# npm
npm install sibyl-ts

# yarn
yarn add sibyl-ts

# pnpm
pnpm add sibyl-ts
```

## Quick Start

### ESM (ES Modules)

```typescript
import { str, num, obj, array, email } from 'sibyl-ts';
```

### CommonJS

```typescript
const { str, num, obj, array, email } = require('sibyl-ts');
```

## Usage

### Basic Validation

```typescript
import { str, num, bool } from 'sibyl-ts';

// String validation
const nameValidator = str({ minLen: 2, maxLen: 50 });
const inspector = nameValidator.judge('Akane Tsunemori'); // Returns: "Akane Tsunemori"

// Number validation (Crime Coefficient)
const crimeCoefficientValidator = num({ min: 0, max: 300 });
const coefficient = crimeCoefficientValidator.judge(45); // Returns: 45

// Boolean validation
const isEnforcerValidator = bool();
const isEnforcer = isEnforcerValidator.judge(true); // Returns: true
```

### Object Validation

```typescript
import { str, num, obj, array, email } from 'sibyl-ts';

// Define a complex object validator for MWPSB personnel
const inspectorValidator = obj({
  name: str({ minLen: 2, maxLen: 50 }),
  crimeCoefficient: num({ min: 0, max: 300 }),
  email: email(),
  roles: array(str()),
  profile: obj({
    joinedAt: date(),
    isLatentCriminal: bool(),
  }),
});

// Type is automatically inferred!
const inspector = inspectorValidator.judge({
  name: 'Akane Tsunemori',
  crimeCoefficient: 28,
  email: 'akane.tsunemori@mwpsb.go.jp',
  roles: ['inspector', 'unit-one'],
  profile: {
    joinedAt: new Date('2112-04-01'),
    isLatentCriminal: false,
  },
});
// Type: { name: string; crimeCoefficient: number; email: string; roles: string[]; profile: { joinedAt: Date; isLatentCriminal: boolean } }
```

### Safe Judgment (No Exceptions)

Use `tryJudge()` when you want to handle validation errors gracefully without throwing exceptions:

```typescript
import { num } from 'sibyl-ts';

const crimeCoefficientValidator = num({ min: 0, max: 300 });

// tryJudge() returns a result object instead of throwing
const result = crimeCoefficientValidator.tryJudge(45);
if (result.type === 'success') {
  console.log(`Crime Coefficient: ${result.data}`); // "Crime Coefficient: 45"
  console.log('Target is not a threat. Trigger will be locked.');
} else {
  console.error('Validation failed:', result.issues);
}

// Example with invalid data
const enforcerCheck = crimeCoefficientValidator.tryJudge(350);
if (enforcerCheck.type === 'error') {
  console.error(enforcerCheck.issues);
  // [{ message: "Value 350 is greater than max 300", path: [] }]
  console.log('Enforcement mode: Lethal Eliminator');
}

// Compare with judge() which throws exceptions
try {
  crimeCoefficientValidator.judge(500); // Throws!
} catch (error) {
  console.error('Exception thrown!');
}
```

**When to use:**

- `judge()` - When you want exceptions thrown (typical validation)
- `tryJudge()` - When you want to handle errors gracefully (user input, APIs)

### Union Types

```typescript
import { union, str, num, literal } from 'sibyl-ts';

// Dominator mode can be lethal or non-lethal
const dominatorModeValidator = union([
  literal('paralyzer'),
  literal('eliminator'),
  literal('decomposer'),
]);

dominatorModeValidator.judge('paralyzer'); // OK
dominatorModeValidator.judge('eliminator'); // OK
dominatorModeValidator.judge('stun'); // Error!
```

### Optional and Nullable

```typescript
import { str, optional, nullable, nullish } from 'sibyl-ts';

// Some inspectors may not have an enforcer assigned
const enforcerNameValidator = optional(str()); // string | undefined
enforcerNameValidator.judge('Shinya Kogami'); // OK
enforcerNameValidator.judge(undefined); // OK

// Crime coefficient can be null for non-citizens
const crimeCoefficientValidator = nullable(num()); // number | null
crimeCoefficientValidator.judge(120); // OK
crimeCoefficientValidator.judge(null); // OK

// Hue color can be nullish
const hueColorValidator = nullish(str()); // string | null | undefined
hueColorValidator.judge('clear'); // OK
hueColorValidator.judge(null); // OK
hueColorValidator.judge(undefined); // OK
```

## Available Validators

### Primitive Validators

#### `str(options?)`

String validation with optional constraints.

```typescript
import { str } from 'sibyl-ts';

// Basic string
const nameValidator = str();
nameValidator.judge('Akane Tsunemori'); // ✓

// With length constraints
const enforcerIdValidator = str({ minLen: 5, maxLen: 10 });
enforcerIdValidator.judge('ENF-001'); // ✓
enforcerIdValidator.judge('E1'); // ✗ Too short

// With pattern (regex)
const idPatternValidator = str({ pattern: /^[A-Z]{3}-\d{3}$/ });
idPatternValidator.judge('INS-042'); // ✓
```

**Options:**

- `minLen?: number` - Minimum string length
- `maxLen?: number` - Maximum string length
- `pattern?: RegExp` - Regex pattern to match
- `coerce?: boolean` - Coerce non-string values to strings

---

#### `num(options?)`

Number validation with optional min/max values.

```typescript
import { num } from 'sibyl-ts';

// Crime Coefficient (0-300)
const coefficientValidator = num({ min: 0, max: 300 });
coefficientValidator.judge(85); // ✓
coefficientValidator.judge(350); // ✗ Too high

// Age with coercion
const ageValidator = num({ min: 18, coerce: true });
ageValidator.judge('25'); // ✓ Coerced to 25
ageValidator.judge(30); // ✓
```

**Options:**

- `min?: number` - Minimum value
- `max?: number` - Maximum value
- `coerce?: boolean` - Coerce strings to numbers

---

#### `bool(options?)`

Boolean validation.

```typescript
import { bool } from 'sibyl-ts';

// Strict boolean
const isLatentValidator = bool();
isLatentValidator.judge(true); // ✓
isLatentValidator.judge(false); // ✓
isLatentValidator.judge(1); // ✗ Not a boolean

// With coercion
const activeFlagValidator = bool({ coerce: true });
activeFlagValidator.judge('true'); // ✓ Coerced to true
activeFlagValidator.judge(1); // ✓ Coerced to true
activeFlagValidator.judge(0); // ✓ Coerced to false
```

**Options:**

- `coerce?: boolean` - Coerce truthy/falsy values to boolean

---

#### `date(options?)`

Date validation.

```typescript
import { date } from 'sibyl-ts';

// Basic date validation
const joinDateValidator = date();
joinDateValidator.judge(new Date('2112-04-01')); // ✓
joinDateValidator.judge('2112-04-01'); // ✓ String is auto-converted

// With min/max constraints
const recentDateValidator = date({
  min: new Date('2110-01-01'),
  max: new Date('2115-12-31'),
});
recentDateValidator.judge(new Date('2112-04-01')); // ✓
recentDateValidator.judge(new Date('2100-01-01')); // ✗ Before min
```

**Expected input:** JavaScript `Date` object or valid date string

**Options:**

- `min?: Date` - Minimum date
- `max?: Date` - Maximum date

---

### String Validators

#### `email()`

Email address validation (RFC 5322).

```typescript
import { email } from 'sibyl-ts';

const emailValidator = email();
emailValidator.judge('akane@mwpsb.go.jp'); // ✓
emailValidator.judge('kogami@enforcer'); // ✗ Invalid format
```

---

#### `url()`

URL validation.

```typescript
import { url } from 'sibyl-ts';

const urlValidator = url();
urlValidator.judge('https://sibyl-system.jp'); // ✓
urlValidator.judge('not-a-url'); // ✗
```

---

#### `uuid()`

UUID validation (v4).

```typescript
import { uuid } from 'sibyl-ts';

const sessionIdValidator = uuid();
sessionIdValidator.judge('550e8400-e29b-41d4-a716-446655440000'); // ✓
sessionIdValidator.judge('not-a-uuid'); // ✗
```

---

#### `ip()`

IP address validation (IPv4 and IPv6).

```typescript
import { ip } from 'sibyl-ts';

const ipValidator = ip();
ipValidator.judge('192.168.1.1'); // ✓ IPv4
ipValidator.judge('2001:0db8::1'); // ✓ IPv6
ipValidator.judge('999.999.999.999'); // ✗ Invalid
```

---

### Complex Validators

#### `array(elementValidator, options?)`

Array validation with typed elements.

```typescript
import { array, str } from 'sibyl-ts';

// Array of enforcer names
const enforcersValidator = array(str());
enforcersValidator.judge(['Shinya Kogami', 'Nobuchika Ginoza']); // ✓
enforcersValidator.judge(['Valid', 123]); // ✗ Element 1 is not a string

// With length constraints
const rolesValidator = array(str(), { minLen: 1, maxLen: 5 });
rolesValidator.judge(['inspector', 'analyst']); // ✓
rolesValidator.judge([]); // ✗ Too short
```

**Options:**

- `minLen?: number` - Minimum array length
- `maxLen?: number` - Maximum array length

---

#### `obj(shape)`

Object validation with typed properties.

```typescript
import { obj, str, num } from 'sibyl-ts';

const enforcerValidator = obj({
  name: str(),
  coefficient: num({ min: 100, max: 300 }),
  division: str(),
});

enforcerValidator.judge({
  name: 'Shinya Kogami',
  coefficient: 180,
  division: 'Unit 1',
}); // ✓

enforcerValidator.judge({
  name: 'Kogami',
  // Missing required fields
}); // ✗
```

**Expected input:** Object matching the shape definition

---

#### `tuple([...validators])`

Fixed-length array (tuple) validation.

```typescript
import { tuple, str, num } from 'sibyl-ts';

// [name, coefficient] pair
const personTupleValidator = tuple([str(), num()]);
personTupleValidator.judge(['Akane Tsunemori', 28]); // ✓
personTupleValidator.judge(['Akane', 28, 'extra']); // ✗ Wrong length
personTupleValidator.judge(['Akane']); // ✗ Missing element
```

**Expected input:** Array with exact length matching validators array

---

#### `union([...validators])`

Union type validation (OR logic).

```typescript
import { union, str, num, literal } from 'sibyl-ts';

// Can be string OR number
const idValidator = union([str(), num()]);
idValidator.judge('INS-001'); // ✓
idValidator.judge(42); // ✓
idValidator.judge(true); // ✗ Not in union

// Dominator modes
const modeValidator = union([literal('paralyzer'), literal('eliminator')]);
modeValidator.judge('paralyzer'); // ✓
```

**Expected input:** Value matching at least one validator in the array

---

#### `record(keyValidator, valueValidator)`

Record/dictionary validation.

```typescript
import { record, str, num } from 'sibyl-ts';

// Map of enforcer names to coefficients
const coefficientsValidator = record(str(), num());
coefficientsValidator.judge({
  Kogami: 180,
  Ginoza: 87,
  Masaoka: 150,
}); // ✓

coefficientsValidator.judge({
  Kogami: '180', // ✗ Value should be number
}); // ✗
```

**Expected input:** Object with dynamic keys/values matching validators

---

### Literal & Enum Validators

#### `literal(value)`

Exact value validation.

```typescript
import { literal } from 'sibyl-ts';

const roleValidator = literal('inspector');
roleValidator.judge('inspector'); // ✓
roleValidator.judge('enforcer'); // ✗ Not exact match

// Works with numbers, booleans too
const statusCodeValidator = literal(200);
statusCodeValidator.judge(200); // ✓
statusCodeValidator.judge(404); // ✗
```

**Expected input:** Exact value specified

---

#### `nativeEnum(enumObject)`

Native TypeScript enum validation.

```typescript
import { nativeEnum } from 'sibyl-ts';

enum Division {
  CriminalInvestigation = 'CI',
  Enforcement = 'ENF',
  Analysis = 'AN',
}

const divisionValidator = nativeEnum(Division);
divisionValidator.judge(Division.Enforcement); // ✓ 'ENF'
divisionValidator.judge('ENF'); // ✓
divisionValidator.judge('INVALID'); // ✗
```

**Expected input:** Enum value or string matching enum

---

### Modifier Validators

#### `optional(validator, defaultValue?)`

Makes a validator optional (allows `undefined`).

```typescript
import { optional, str } from 'sibyl-ts';

// Without default value
const nicknameValidator = optional(str());
nicknameValidator.judge('Ko'); // ✓
nicknameValidator.judge(undefined); // ✓
nicknameValidator.judge(null); // ✗ Use nullable() for null

// With default value
const rankValidator = optional(str(), 'Inspector');
rankValidator.judge('Enforcer'); // ✓ 'Enforcer'
rankValidator.judge(undefined); // ✓ 'Inspector' (default)
```

**Type:** `T | undefined` (or `T` if default value provided)

**Parameters:**

- `validator` - The validator to make optional
- `defaultValue?` - Optional default value when undefined

---

#### `nullable(validator)`

Makes a validator nullable (allows `null`).

```typescript
import { nullable, num } from 'sibyl-ts';

const previousCoefficientValidator = nullable(num());
previousCoefficientValidator.judge(150); // ✓
previousCoefficientValidator.judge(null); // ✓ No previous record
previousCoefficientValidator.judge(undefined); // ✗
```

**Type:** `T | null`

---

#### `nullish(validator)`

Makes a validator nullish (allows `null` AND `undefined`).

```typescript
import { nullish, str } from 'sibyl-ts';

const hueColorValidator = nullish(str());
hueColorValidator.judge('clear'); // ✓
hueColorValidator.judge(null); // ✓
hueColorValidator.judge(undefined); // ✓
```

**Type:** `T | null | undefined`

## TypeScript Configuration

For best results, enable strict mode in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

## Error Handling

Validators throw detailed errors when validation fails:

```typescript
import { JudgmentError } from 'sibyl-ts';

try {
  const validator = num({ min: 0, max: 300 });
  validator.judge(350); // Crime coefficient too high!
} catch (error) {
  if (error instanceof JudgmentError) {
    console.log(error.issues);
    // [{ message: "Value 350 is greater than max 300", path: [] }]
  }
}
```

## Troubleshooting

### Module Resolution Issues

If you encounter module resolution errors:

1. **Ensure Node.js version >= 16.0.0**
2. **For ESM**: Make sure your `package.json` has `"type": "module"`
3. **For TypeScript**: Set `"moduleResolution": "node"` in `tsconfig.json`

### Type Inference Not Working

Make sure TypeScript strict mode is enabled and you're using TypeScript 5.0+.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

ISC - see [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.
