# E2E Testing Guide

This document describes how to run, debug, and extend the end-to-end (e2e) tests
across all applications in the Todos monorepo.

For tooling decisions and the directory structure rationale, see [ADR 0025](../docs/adr/0025-e2e-testing-strategy.md).

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Directory Layout](#directory-layout)
3. [Running E2E Tests](#running-e2e-tests)
   - [API (`apps/api`)](#api-appsapi)
   - [MCP (`apps/mcp`)](#mcp-appsmcp)
   - [Web (`apps/web`)](#web-appsweb)
   - [Mobile (`apps/mobile`)](#mobile-appsmobile)
   - [All Apps (Orchestrator)](#all-apps-orchestrator)
4. [Firebase Emulator Setup](#firebase-emulator-setup)
5. [CI Integration](#ci-integration)
6. [Writing New E2E Tests](#writing-new-e2e-tests)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

Run the API and MCP smoke tests (no Firebase emulator required):

```bash
yarn e2e:smoke
```

Run with the Firebase emulator for full scenarios:

```bash
# Start the emulator stack
docker compose -f tools/e2e/env/docker-compose.e2e.yml up -d

# Run all e2e suites
yarn e2e

# Tear down
docker compose -f tools/e2e/env/docker-compose.e2e.yml down
```

---

## Directory Layout

```text
apps/
  api/
    e2e/
      fixtures/    ← path constants and shared test data
      scenarios/   ← *.e2e-spec.ts files (Vitest + supertest)
      support/     ← createTestApp() helper, shared setup
    vitest.config.e2e.ts
  mcp/
    e2e/
      fixtures/
      scenarios/
      support/
    vitest.config.e2e.ts
  web/
    e2e/
      fixtures/    ← env constants (base URL, test user)
      journeys/    ← *.journey.ts Playwright test files
      support/     ← base page objects
  mobile/
    e2e/
      fixtures/
      journeys/    ← *.yaml Maestro flow files
      support/

tools/
  e2e/
    env/
      docker-compose.e2e.yml          ← emulator + API container stack
      firebase-emulator.config.json   ← emulator port/project config
    scripts/
      run-e2e.sh      ← local developer runner
      run-e2e-ci.sh   ← CI runner (writes JUnit XML reports)
    reports/          ← JUnit XML outputs (git-ignored, dir tracked)
```

---

## Running E2E Tests

### API (`apps/api`)

The API uses **Vitest + supertest** against a `@nestjs/testing`-bootstrapped application.

```bash
# Smoke tests only (no Firebase emulator needed)
yarn workspace @todos/api test:e2e:smoke

# Full e2e suite
yarn workspace @todos/api test:e2e
```

For full scenarios that touch Firebase Auth or Firestore, set these environment variables
(automatically configured when using Docker Compose):

```bash
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_PROJECT_ID=todos-e2e
yarn workspace @todos/api test:e2e
```

### MCP (`apps/mcp`)

Same runner as API. The MCP e2e suite validates the Streamable HTTP transport endpoint
(`POST /mcp`, ADR 0020) and the health endpoint.

```bash
yarn workspace @todos/mcp test:e2e:smoke
yarn workspace @todos/mcp test:e2e
```

### Web (`apps/web`)

> ⚠️ **Playwright is not yet installed.** The journey files in `apps/web/e2e/journeys/`
> are placeholders. Follow these steps once the Playwright PBI is completed:

```bash
# Install Playwright (one-time)
yarn workspace @todos/web add -D @playwright/test
yarn playwright install --with-deps chromium

# Run journeys
yarn workspace @todos/web test:e2e:smoke
yarn workspace @todos/web test:e2e
```

Playwright will use `playwright.config.ts` (to be created in `apps/web/`) and automatically
start the Vite dev server via `webServer` config.

### Mobile (`apps/mobile`)

> ⚠️ **Maestro is not yet installed.** The YAML flows in `apps/mobile/e2e/journeys/`
> are placeholders. Follow these steps once the Maestro PBI is completed:

```bash
# Install Maestro CLI (one-time)
curl -Ls "https://get.maestro.mobile.dev" | bash

# Start Expo app on simulator
yarn workspace @todos/mobile android   # or ios

# Run flows
maestro test apps/mobile/e2e/journeys/auth-login.yaml
maestro test apps/mobile/e2e/journeys/todos-crud.yaml
```

Environment variables for Maestro flows:

```bash
export E2E_TEST_EMAIL=e2e-user@example.com
export E2E_TEST_PASSWORD=Test@1234
```

### All Apps (Orchestrator)

Root-level scripts run all suites in sequence:

```bash
# Smoke only (fast, no emulator)
yarn e2e:smoke

# Full suite (requires Docker and emulator)
yarn e2e
```

Or use the shell scripts directly:

```bash
# Local developer run
./tools/e2e/scripts/run-e2e.sh --smoke
./tools/e2e/scripts/run-e2e.sh

# Specific suite
./tools/e2e/scripts/run-e2e.sh --suite=api
./tools/e2e/scripts/run-e2e.sh --suite=mcp
```

---

## Firebase Emulator Setup

Full e2e scenarios (auth flows, Firestore operations) require the Firebase emulator.

### Docker Compose (recommended)

```bash
# Start the emulator + API container
docker compose -f tools/e2e/env/docker-compose.e2e.yml up -d

# Check status
docker compose -f tools/e2e/env/docker-compose.e2e.yml ps

# View emulator UI
open http://localhost:4000

# Tear down (preserves seed data in a named volume)
docker compose -f tools/e2e/env/docker-compose.e2e.yml down

# Tear down + wipe seed data
docker compose -f tools/e2e/env/docker-compose.e2e.yml down -v
```

### Firebase CLI (alternative)

If you have the Firebase CLI installed locally:

```bash
firebase emulators:start \
  --only auth,firestore \
  --project todos-e2e \
  --import tools/e2e/env/firebase-seed \
  --export-on-exit tools/e2e/env/firebase-seed
```

Then set emulator host variables in your shell before running tests.

---

## CI Integration

### Smoke Tier (every PR)

The `ci.yml` workflow includes an `e2e-smoke` job that runs after unit tests:

- Runs `apps/api` and `apps/mcp` smoke scenarios.
- Does **not** require Docker or the Firebase emulator.
- Publishes JUnit XML reports as workflow artifacts on failure.

### Full Tier (nightly / merge to main)

The `e2e-full.yml` workflow (to be created once Playwright and Maestro are installed):

- Starts the Firebase emulator container.
- Runs all suites including web (Playwright) and mobile (Maestro cloud device farm).
- Publishes traces, screenshots, and XML reports as artifacts.

### Report Artifacts

CI uploads reports to `tools/e2e/reports/`:

```
junit-api.xml
junit-mcp.xml
playwright-report/   (apps/web/)
maestro-report/      (apps/mobile/)
```

---

## Writing New E2E Tests

### API / MCP (Vitest + supertest)

1. Add a new file in `apps/<app>/e2e/scenarios/<name>.e2e-spec.ts`.
2. Import `createTestApp` from `../support/app-factory`.
3. Use `request(app.getHttpServer())` for HTTP assertions.
4. Keep tests stateless — set up and tear down in `beforeAll`/`afterAll`.

```typescript
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from '../support/app-factory';

describe('My feature (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => { app = await createTestApp(); });
  afterAll(async () => { await app.close(); });

  it('GET /api/v1/my-feature → 200', async () => {
    await request(app.getHttpServer()).get('/api/v1/my-feature').expect(200);
  });
});
```

### Web (Playwright — once installed)

1. Add a new file in `apps/web/e2e/journeys/<name>.journey.ts`.
2. Import `{ test, expect }` from `@playwright/test`.
3. Use Page Object helpers from `../support/` for reusable interactions.

### Mobile (Maestro — once installed)

1. Add a new YAML file in `apps/mobile/e2e/journeys/<name>.yaml`.
2. Follow the Maestro YAML DSL documented at <https://maestro.mobile.dev/api-reference>.
3. Reference environment variables for credentials (never hard-code them).

---

## Troubleshooting

### `ECONNREFUSED` on app.getHttpServer()

The NestJS app failed to boot. Check:
- Missing environment variables (e.g., Firebase credentials).
- Module import errors in `AppModule`.

Run `yarn workspace @todos/api build` first to surface TypeScript errors.

### Firebase emulator not reachable

- Ensure Docker is running: `docker info`.
- Check emulator logs: `docker compose -f tools/e2e/env/docker-compose.e2e.yml logs firebase-emulator`.
- Verify ports 9099 and 8080 are not occupied: `lsof -i :9099`.

### Vitest e2e tests are picked up by the unit test run

Unit test configs (`vitest.config.ts`) use `include: ['**/*.spec.ts']` which does not
match `*.e2e-spec.ts`. The e2e configs (`vitest.config.e2e.ts`) use
`include: ['e2e/**/*.e2e-spec.ts']`. If you see cross-contamination, verify that
neither config uses a wildcard broad enough to capture the other pattern.

### Playwright browser not found

Run `yarn playwright install --with-deps chromium` from inside `apps/web/`.
