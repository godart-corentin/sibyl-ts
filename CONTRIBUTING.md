# Contributing to sibyl-ts

Thank you for your interest in contributing! This document provides guidelines for contributing to the validator library.

## Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/godart-corentin/sibyl-ts.git
   cd sibyl-ts
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```

## Development Workflow

### Building the Library

Build both ESM and CommonJS outputs:

```bash
npm run build
```

Build specific formats:

```bash
npm run build:esm   # ESM only
npm run build:cjs   # CommonJS only
```

### Running Tests

```bash
npm test              # Run tests once
npm run test:watch   # Watch mode
npm run test:coverage # With coverage report
```

### Code Quality

```bash
npm run typecheck    # Type checking
npm run lint         # Lint code
npm run format       # Format code
npm run format:check # Check formatting
```

## Code Style

- **TypeScript**: All code must be written in TypeScript
- **Formatting**: We use Prettier for code formatting
- **Linting**: We use ESLint with TypeScript rules
- **Testing**: All new features must include tests

## Adding New Validators

1. Create a new file in `src/validators/` for your validator
2. Export the validator from `src/validators/index.ts`
3. Add comprehensive tests in a `.spec.ts` file
4. Update the README.md with usage examples
5. Document in CHANGELOG.md

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass (`npm test`)
6. Ensure type checking passes (`npm run typecheck`)
7. Format your code (`npm run format`)
8. Commit your changes with descriptive commit messages
9. Push to your fork
10. Open a Pull Request

## Commit Message Guidelines

- Use clear, descriptive commit messages
- Start with a verb in present tense (e.g., "Add", "Fix", "Update")
- Reference issue numbers when applicable

## Questions?

Feel free to open an issue for any questions or concerns.
