# Agents

This file defines custom agents and their instructions for the Todos project.

## General Agent Guidelines

All agents working on this project should:

1. Follow the [Project Constitution](constitution.md)
2. Adhere to the [Copilot Instructions](copilot-instructions.md)
3. For any `.tsx` or `.jsx` file, enforce the rules in [UI Component Guidelines](instructions/ui-components.instructions.md)
4. Use the monorepo structure appropriately
5. Ensure changes are tested and documented
6. Maintain backward compatibility where possible

## Bounded Domains

- When planning new features or code additions, ensure changes are currently bounded by constitutional documentation and ADRs.
- If a new domain or significant architectural change is needed, first [askQuestions] to bound the scope
- then create an ADR to document the decision and update [Project Constitution](constitution.md) before implementing code.
- Wait for ADR approval before writing code that depends on the new domain or architectural change.

## Custom Agents

### Code Review Agent

**Purpose**: Automated code review for pull requests.

**Instructions**:

- Check adherence to coding standards
- Verify test coverage
- Ensure proper error handling
- Validate TypeScript types
- Confirm documentation updates

### Testing Agent

**Purpose**: Focused on test creation and validation.

**Instructions**:

- Write comprehensive unit tests
- Use Vitest framework
- Mock dependencies properly
- Ensure edge cases are covered
- Run tests and report results

### Documentation Agent

**Purpose**: Maintain and update project documentation.

**Instructions**:

- Update READMEs for new features
- Add JSDoc comments to public APIs
- Keep constitution and instructions current
- Generate API documentation
