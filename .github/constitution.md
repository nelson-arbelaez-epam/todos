# Project Constitution

This document outlines the core principles, standards, and guidelines for the Todos project to ensure consistency, maintainability, and quality across all components.

## Architecture Principles

- **Monorepo Structure**: The project uses a monorepo with apps and shared packages.
- **Modular Design**: Separate concerns into bounded packages (`@todos/core`, `@todos/store`, `@todos/firebase`, `@todos/shared`) with contracts in core and adapters at the edges.
- **API Consistency**: All APIs follow RESTful principles with consistent error handling and response formats.
- **API Documentation**: All API applications must integrate Swagger/OpenAPI for automatic documentation generation and endpoint exposure.

## Package Responsibilities

- **Apps are Composition-Only**: Code under `apps/**` must wire modules, expose transport endpoints, and host runtime configuration only. Business logic must live in packages.
- **@todos/core Owns Domain Contracts**: `@todos/core` is the source of truth for business objects, repository contracts, and shared domain DTO primitives.
- **@todos/store Owns Store Layer Logic**: `@todos/store` provides store services and module wiring for repository-backed business operations and depends only on domain contracts.
- **@todos/firebase Owns Firebase Infrastructure**: `@todos/firebase` owns Firebase app setup, auth/firestore services, and Firebase repository adapters that implement `@todos/core` contracts.
- **@todos/shared Owns Cross-App Infrastructure**: `@todos/shared` provides cross-cutting app utilities (for example health checks, global filters, shared assets) that are not business-domain ownership.
- **No Circular Dependencies**: `@todos/store` and `@todos/firebase` must not depend on each other directly. Integration must happen through `@todos/core` repository tokens/contracts.
- **ADR Compliance**: Storage/auth implementations must respect accepted ADR decisions, especially backend-only Firestore access and API-enforced authorization.

## Coding Standards

- **Language**: TypeScript for all code.
- **Framework**: NestJS for backend applications; preserve existing framework choices in non-backend apps.
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
- Use `@todos/core` for shared business DTOs/contracts.
- Ensure code is type-safe and well-tested.
- Follow the coding standards outlined above.
- Prefer existing utilities over reinventing functionality.
