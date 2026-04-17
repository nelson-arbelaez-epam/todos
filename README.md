# todos

A monorepo of Todo applications and shared packages.

## Docker Compose Dev Environment

The fastest way to run the full backend + frontend stack locally is with Docker
Compose.  Mobile development is intentionally excluded from containers — see
[Running mobile locally](#running-mobile-locally).

### Prerequisites

| Requirement | Version |
|---|---|
| Docker Desktop / Docker Engine | ≥ 24 |
| Docker Compose plugin | ≥ 2.24 |
| Node.js + Yarn (host) | Node ≥ 20, Yarn 4 |

> **Why Yarn on the host?**  The workspace `node_modules` directory is
> bind-mounted into each container.  Running `yarn install` on the host
> populates it once; containers share the result without reinstalling.

### First-time setup

```bash
# 1. Enable Corepack and install workspace dependencies on the host
corepack enable
yarn install

# 2. Create your local env file from the example
cp .env.example .env
# Edit .env and fill in your Firebase credentials (FIREBASE_PROJECT_ID, etc.)
```

### Start the dev stack

```bash
docker compose -f docker-compose.dev.yml up
```

This brings up four services in dependency order:

| Service | URL | Description |
|---|---|---|
| `package-builder` | — | Watches and rebuilds shared packages (`@todos/core`, `@todos/store`, `@todos/firebase`, `@todos/branding`) |
| `api` | <http://localhost:3000> | NestJS Todos API (hot-reload via `nest start --watch`) |
| `mcp` | <http://localhost:3010> | NestJS MCP server (hot-reload via `nest start --watch`) |
| `web` | <http://localhost:5173> | Vite React frontend (HMR enabled) |

`api` and `mcp` wait for `package-builder` to finish its initial build before
starting, so the first `up` takes roughly 60–90 seconds.

### Start a single service

```bash
# Start only the web frontend (package-builder starts automatically as a dependency)
docker compose -f docker-compose.dev.yml up web

# Start only api + its dependencies
docker compose -f docker-compose.dev.yml up api
```

### View logs

```bash
# Follow all service logs
docker compose -f docker-compose.dev.yml logs -f

# Follow a specific service
docker compose -f docker-compose.dev.yml logs -f api
```

### Stop and clean up

```bash
# Stop all services (preserves containers)
docker compose -f docker-compose.dev.yml stop

# Remove containers
docker compose -f docker-compose.dev.yml down
```

### Environment variables

All services read from `.env` (and optionally `.env.local` for personal
overrides).  See `.env.example` for the full list with inline documentation.

Key variables:

| Variable | Default | Notes |
|---|---|---|
| `FIREBASE_PROJECT_ID` | — | **Required** for the `api` service |
| `FIREBASE_WEB_API_KEY` | — | **Required** for the `api` login endpoint |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | — | One of the three credential strategies |
| `TODOS_API_URL` | `http://localhost:3000` | Overridden to `http://api:3000` inside Docker automatically |
| `VITE_TODOS_API_URL` | `http://localhost:3000` | Browser-facing; must remain a `localhost` address. Update manually if you change `API_PORT`. |
| `API_PORT` | `3000` | Host port for the API container |
| `MCP_PORT` | `3010` | Host port for the MCP container |
| `WEB_PORT` | `5173` | Host port for the web container |

### Running mobile locally

`mobile` is an Expo (React Native) app and is **not containerised**.  Run it
directly on the host:

```bash
# Install dependencies (if not done yet)
corepack enable && yarn install

# Start the Expo dev server
yarn dev:mobile
```

Expo will print a QR code; scan it with the Expo Go app on your device or use
an iOS/Android simulator.  The mobile app reads `EXPO_PUBLIC_TODOS_API_URL`
from `.env` to reach the API — make sure the API is running (either via Docker
Compose or `yarn dev:api`) and the URL is reachable from your device/emulator.

### Troubleshooting

**Services fail immediately or show `MODULE_NOT_FOUND` errors**

The container cannot find `node_modules`.  Make sure you ran `yarn install` on
the host before starting Docker Compose:

```bash
yarn install
docker compose -f docker-compose.dev.yml up
```

**`api` or `mcp` fail with "package not found" or TypeScript errors**

The shared packages may not have been built yet.  Restart only the
`package-builder` service and wait for it to become healthy:

```bash
docker compose -f docker-compose.dev.yml restart package-builder
```

**Port already in use**

Override the host port in `.env` or `.env.local`:

```bash
# .env.local
API_PORT=3001
MCP_PORT=3011
WEB_PORT=5174
```

**Changes to shared packages are not picked up**

`package-builder` watches `packages/*/src` and recompiles automatically.
Check its logs to confirm a rebuild has happened:

```bash
docker compose -f docker-compose.dev.yml logs -f package-builder
```

**Native module errors (e.g. on macOS with Apple Silicon)**

If you see errors about native binaries being incompatible, your host
`node_modules` may contain macOS-compiled binaries.  Remove and reinstall
inside a Linux container:

```bash
docker compose -f docker-compose.dev.yml run --rm api \
  sh -c "corepack enable && yarn install"
```

---

## Code Quality

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

Before opening a pull request, run the following command to validate your changes locally:

```bash
yarn biome check .
```

To auto-fix formatting issues:

```bash
yarn format
```

To run lint only:

```bash
yarn lint
```

> **Note:** The `biome check` CI job is a required status check. PRs cannot be merged until it passes.

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

Some packages (e.g. `@todos/api`) depend on built artifacts from `@todos/core`:

```bash
yarn workspace @todos/core build
```

---

## CI and Branch Protection

### Continuous Integration

Pull requests and pushes to `main` are automatically tested by the **CI** GitHub Actions workflow (`.github/workflows/ci.yml`). The workflow:

1. Checks out the repository.
2. Installs dependencies with `yarn install --immutable`.
3. Builds `@todos/core` (required by dependent packages).
4. Runs the full test suite with `yarn test`.

### Required Status Checks (Branch Protection)

To enforce the CI quality gate, configure branch protection on the `main` branch in **Settings → Branches → Branch protection rules**:

- Enable **Require status checks to pass before merging**.
- Add **`CI / test`** as a required status check.
- Enable **Require branches to be up to date before merging** (recommended).

This ensures no PR can be merged unless all automated tests pass.
