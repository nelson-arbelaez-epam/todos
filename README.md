# todos

A monorepo of Todo applications and shared packages.

## Running Tests Locally

This project uses [Vitest](https://vitest.dev/) for unit and integration tests. All commands require [Yarn](https://yarnpkg.com/) (managed via Corepack).

### Prerequisites

```bash
corepack enable
yarn install
```

### Run all tests

```bash
yarn test
```

This runs the full workspace test suite (all apps and packages) using `vitest.workspace.config.ts`.

### Run tests for a single app or package

```bash
# API
yarn workspace @todos/api test

# Core package
yarn workspace @todos/core test

# Store package
yarn workspace @todos/store test

# Firebase package
yarn workspace @todos/firebase test

# MCP app
yarn workspace @todos/mcp test
```

### Build required packages before testing (if needed)

Some packages (e.g. `@todos/api`) depend on built artifacts from `@todos/core` and `@todos/shared`:

```bash
yarn workspace @todos/core build
yarn workspace @todos/shared build
```

---

## CI and Branch Protection

### Continuous Integration

Pull requests and pushes to `main` are automatically tested by the **CI** GitHub Actions workflow (`.github/workflows/ci.yml`). The workflow:

1. Checks out the repository.
2. Installs dependencies with `yarn install --immutable`.
3. Builds `@todos/core` and `@todos/shared` (required by dependent packages).
4. Runs the full test suite with `yarn test`.

### Required Status Checks (Branch Protection)

To enforce the CI quality gate, configure branch protection on the `main` branch in **Settings → Branches → Branch protection rules**:

- Enable **Require status checks to pass before merging**.
- Add **`CI / Run Tests`** as a required status check.
- Enable **Require branches to be up to date before merging** (recommended).

This ensures no PR can be merged unless all automated tests pass.
