# Agents

This file defines custom agents and their instructions for the Todos project.

## General Agent Guidelines

All agents working on this project should:

1. Follow the [Project Constitution](constitution.md)
2. Adhere to the [Copilot Instructions](copilot-instructions.md)
3. Use the monorepo structure appropriately
4. Ensure changes are tested and documented
5. Maintain backward compatibility where possible

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