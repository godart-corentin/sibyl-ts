# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-01-14

### Added

- `omit()` validator for creating validators with specific object properties omitted
- GitHub Actions CI workflow for automated build and test validation

### Fixed

- ESLint configuration now properly excludes test files to prevent parsing errors
- Code formatting issues

## [0.2.0] - 2026-01-13

### Added

- `partial()` validator for creating validators with optional object properties
- Playground directory for testing and experimenting with validators
- Object validators now organized in dedicated `object/` folder (matching string validators structure)

### Changed

- Moved `obj()` validator to `src/validators/object/object.ts`
- Updated exports to maintain backward compatibility

## [0.1.0] - 2026-01-11

### Added

- Initial release of sibyl-ts (TypeScript validation library inspired by Psycho-Pass Sibyl System)
- Type-safe validators: string, number, boolean, date, array, object, tuple, union, literal, enum
- String validators: email, URL, UUID, IP address
- Safe parsing with `tryJudge()` method
- Comprehensive error handling with detailed error messages
- Full TypeScript support with automatic type inference
- Dual ESM/CommonJS module support
- Complete test suite with vitest
