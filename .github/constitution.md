# Project Constitution

This document outlines the core principles, standards, and guidelines for the Todos project to ensure consistency, maintainability, and quality across all components.

## Architecture Principles

- **Monorepo Structure**: The project uses a monorepo with apps and shared packages.
- **Modular Design**: Separate concerns into distinct packages (e.g., DTOs, transformers, validators).
- **API Consistency**: All APIs follow RESTful principles with consistent error handling and response formats.
- **API Documentation**: All API applications must integrate Swagger/OpenAPI for automatic documentation generation and endpoint exposure.

## Coding Standards

- **Language**: TypeScript for all code.
- **Framework**: NestJS for backend applications.
- **Linting**: Use Biome for code formatting and linting.
- **Testing**: Vitest for unit and integration tests. Aim for high coverage.
- **Naming Conventions**:
  - Classes: PascalCase
  - Methods/Functions: camelCase
  - Files: kebab-case.ts
  - Constants: UPPER_SNAKE_CASE

## Development Practices

- **Version Control**: Git with conventional commits.
- **Dependencies**: Use Yarn for package management.
- **Code Reviews**: All changes require review.
- **Documentation**: Maintain READMEs and inline comments for complex logic.

## Quality Assurance

- **Testing**: Write tests for all new features and bug fixes.
- **Type Safety**: Leverage TypeScript's type system fully. Avoid `any` types.
- **Error Handling**: Implement global exception filters with comprehensive logging in all NestJS applications.
- **Performance**: Optimize for performance and scalability.
- **Test Coverage**: Maintain 90% unit test coverage and at least 50% integration test coverage in all commits.

## AI Consistency Rules

**When using AI assistance:**

- Always follow the established patterns in the codebase.
- Use the shared DTOs and transformers from packages.
- Ensure code is type-safe and well-tested.
- Follow the coding standards outlined above.
- Prefer existing utilities over reinventing functionality.
