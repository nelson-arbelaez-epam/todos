# Copilot Instructions

These instructions guide GitHub Copilot's behavior across the Todos project to ensure consistency with our standards and practices.

## General Guidelines

- Always adhere to the [Project Constitution](constitution.md)
- Consult existing [ADRs](docs/adr/**) for architectural decisions.
- Use TypeScript with strict type checking.
- Follow NestJS patterns for API development.
- Leverage shared packages (dtos) for data structures and validation.
- Write comprehensive tests using Vitest.
- Use Biome for code formatting.

## Bounded Domains 
- When planning new features or code additions, ensure changes are currently bounded by constitutional documentation and ADRs.
- If a new domain or significant architectural change is needed, first [askQuestions] to bound the scope 
- then create an ADR to document the decision and update [Project Constitution](constitution.md) before implementing code.
- Wait for ADR approval before writing code that depends on the new domain or architectural change.

## Code Generation Rules

- **Imports**: Use relative imports for internal modules, absolute for external.
- **Error Handling**: Implement try-catch blocks with proper logging.
- **Async Code**: Use async/await consistently.
- **Naming**: Follow the conventions in the constitution.
- **Documentation**: Add JSDoc comments for public APIs.

## Testing

- Write unit tests for all classes and functions.
- Use descriptive test names.
- Mock external dependencies appropriately.
- Aim for high test coverage.

## Best Practices

- Prefer functional programming where possible.
- Avoid global state.
- Use dependency injection in NestJS.
- Keep functions small and focused.
- Follow DRY principle but don't over-abstract.

## When in Doubt

Refer to existing code in the project for patterns and examples. If something is unclear, check the constitution or ask for clarification.