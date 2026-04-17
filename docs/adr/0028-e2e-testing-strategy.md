# ADR 0025 — End-to-End Testing Strategy and Structure

- Status: Accepted
- Date: 2026-04-12
- Related: GitHub Issue (Spike: E2E Testing); ADR 0022 (long-lived API token); ADR 0020 (MCP transport); ADR 0021 (UI architecture)

## Context

The repository has strong unit and integration test coverage using Vitest across all apps and packages, but end-to-end (e2e) testing strategy is inconsistent:

| App | Prior State |
| --- | --- |
| `apps/api` | Legacy `test/jest-e2e.json` + one e2e spec using `@nestjs/testing` + supertest; no stable emulator orchestration |
| `apps/mcp` | One `test/app.e2e-spec.ts` using `@nestjs/testing` + supertest; no contract-level MCP protocol flows |
| `apps/web` | Vite + Vitest (jsdom) only; no browser-level or real-network e2e setup |
| `apps/mobile` | Expo app with React Native Testing Library present; no runnable e2e scripts or mobile test runner wired |

ADR 0022 introduces long-lived API tokens that must survive MCP server restarts — a behaviour that cannot be verified by unit tests alone. End-to-end tests spanning the auth flow, token issuance, and protected endpoint consumption are required.

This ADR defines a repository-wide e2e strategy that is framework-agnostic where possible, covers all four app types, and establishes the CI integration model.

## Decision

### 1. Cross-App E2E Folder Structure

Each app receives a dedicated `e2e/` directory at its root, organised by the test artefact type relevant to that app:

```text
apps/
  api/
    e2e/
      fixtures/      ← shared test data, paths, env constants
      scenarios/     ← Vitest e2e scenario files (*.e2e-spec.ts)
      support/       ← app factory, helpers, shared setup/teardown
  mcp/
    e2e/
      fixtures/
      scenarios/
      support/
  web/
    e2e/
      fixtures/
      journeys/      ← Playwright test files (*.journey.ts)
      support/       ← base page objects, auth helpers
  mobile/
    e2e/
      fixtures/
      journeys/      ← Maestro YAML flows (*.yaml)
      support/       ← environment docs, flow utilities

tools/
  e2e/
    env/
      docker-compose.e2e.yml         ← Firebase emulator + API container stack
      firebase-emulator.config.json  ← emulator port/project config
    scripts/
      run-e2e.sh      ← local developer runner
      run-e2e-ci.sh   ← CI runner (JUnit reports, no Docker start)
    reports/
      .gitkeep        ← dir tracked; report files excluded via .gitignore
```

The legacy `apps/api/test/` and `apps/mcp/test/` directories are preserved for backwards compatibility but new e2e work goes into `e2e/`.

### 2. Tooling Selection by App Type

#### API (`apps/api`) — Vitest + supertest

**Selected:** Vitest (already used for unit tests) + supertest (already a dev dependency).

| Criterion | Assessment |
| --- | --- |
| CI reliability | Excellent — no external process required for smoke tests |
| Execution time | Fast — NestJS app boots in-process via `@nestjs/testing` |
| Parallelisation | Vitest worker pool |
| Emulator orchestration | Optional — smoke tests run without emulator; full scenarios use Firebase Auth/Firestore emulator via `FIREBASE_AUTH_EMULATOR_HOST` env var |
| Debuggability | Excellent — native Node.js debugging, Vitest UI |

A dedicated `vitest.config.e2e.ts` excludes unit spec files and includes only `e2e/**/*.e2e-spec.ts`.

**Rejected alternatives:**

- Jest — no benefit over Vitest given the existing toolchain; migration cost unjustified.
- Pactum / k6 — appropriate for contract and load testing, not bootstrapping smoke e2e.

#### MCP (`apps/mcp`) — Vitest + supertest

Same rationale as API. The Streamable HTTP transport endpoint (`POST /mcp`, ADR 0020) is tested via supertest for reachability. Full protocol-level flows (tool invocations) require an MCP SDK client and are deferred to a follow-up PBI.

#### Web (`apps/web`) — Playwright (recommended, not yet installed)

**Selected:** [Playwright](https://playwright.dev)

| Criterion | Assessment |
| --- | --- |
| CI reliability | Excellent — Playwright has first-class Docker/CI support; headless mode by default |
| Execution time | Moderate — browser startup adds ~2s per worker; parallelisation compensates |
| Parallelisation | Built-in sharding and worker-per-test model |
| Emulator orchestration | `webServer` config option starts the Vite dev server automatically in CI |
| Debuggability | Excellent — trace viewer, screenshot-on-failure, video recording |
| React compatibility | Full support for React 19 apps |

**Rejected alternatives:**

- Cypress — slower startup, heavier CI resource requirements, no multi-browser parallelisation in the open-source tier.
- Vitest browser mode — still experimental for full navigation flows; designed for component tests, not multi-page journeys.

Installation (deferred to follow-up PBI):

```bash
yarn workspace @todos/web add -D @playwright/test
yarn playwright install --with-deps chromium
```

#### Mobile (`apps/mobile`) — Maestro (recommended, not yet installed)

**Selected:** [Maestro](https://maestro.mobile.dev)

| Criterion | Assessment |
| --- | --- |
| CI reliability | Good — cloud device farms available; local simulator support |
| Execution time | Moderate — simulator start adds overhead; Maestro flows run fast once booted |
| Parallelisation | Maestro Cloud supports parallel flow execution |
| Emulator orchestration | Maestro manages its own device connection; Expo app must be pre-built |
| Debuggability | Video recording, failure screenshots, verbose flow logs |
| Expo compatibility | Full support for Expo-built apps on iOS and Android simulators |

**Rejected alternatives:**

- Detox — requires native build setup for each platform; higher CI complexity for Expo managed workflow.
- Appium — verbose setup; session management overhead not justified for this stage.

Installation (deferred to follow-up PBI):

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### 3. CI Integration Model

Two tiers of e2e runs:

| Tier | Trigger | Suites | Runner |
| --- | --- | --- | --- |
| **Smoke** | Every PR to `main` | `api:smoke`, `mcp:smoke` | `run-e2e-ci.sh --smoke` |
| **Full** | Push to `main` or nightly schedule | All suites including web + mobile (once tooling is installed) | `run-e2e-ci.sh` |

The smoke tier runs within the existing `ci.yml` workflow.
A new `e2e-full.yml` workflow handles the nightly/merge full suite.

Artifacts published on failure:

- JUnit XML test reports (`tools/e2e/reports/junit-*.xml`)
- Playwright trace files (`apps/web/playwright-report/`)
- Maestro flow recordings (`apps/mobile/e2e/reports/`)

### 4. Firebase Emulator Integration

E2E tests that need auth or Firestore must target the Firebase emulator, not production.

Environment variables used by the API to switch to emulators:

```
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_PROJECT_ID=todos-e2e
```

The `tools/e2e/env/docker-compose.e2e.yml` file provides a reproducible container stack for local and CI use.

Smoke tests (health and HTTP contract checks) **do not** require the emulator. This ensures PRs can run meaningful e2e checks without Docker.

### 5. Smoke E2E Scenarios (Initial Set)

| App | Scenario | Tooling | Emulator required? |
| --- | --- | --- | --- |
| `api` | `GET /api/v1/health` → 200 | Vitest + supertest | No |
| `api` | `POST /auth/login` without body → 400 | Vitest + supertest | No |
| `api` | `POST /auth/tokens` without Bearer → 401 | Vitest + supertest | No |
| `api` | `GET /auth/tokens` without Bearer → 401 | Vitest + supertest | No |
| `mcp` | `GET /api/v1/health` → 200 | Vitest + supertest | No |
| `mcp` | `POST /mcp` without session → 4xx | Vitest + supertest | No |
| `web` | Login journey (placeholder) | Playwright | Yes (emulator) |
| `web` | Todo CRUD journey (placeholder) | Playwright | Yes (emulator) |
| `mobile` | Auth login flow (placeholder) | Maestro YAML | Yes (emulator) |
| `mobile` | Todo CRUD flow (placeholder) | Maestro YAML | Yes (emulator) |

### 6. NPM Scripts Convention

Every app exposes consistent script names:

| Script | Purpose |
| --- | --- |
| `test:e2e` | Run the full e2e suite for this app |
| `test:e2e:smoke` | Run only smoke scenarios (fast; no emulator) |

Root-level orchestrators:

| Script | Purpose |
| --- | --- |
| `e2e:smoke` | Run smoke e2e for all apps |
| `e2e` | Run full e2e suite for all apps |

## Options Evaluated

| Option | Rejected? | Reason |
| --- | --- | --- |
| Playwright for web | ✅ Selected | Best CI reliability, tracing, React 19 compat |
| Cypress for web | Rejected | Slower CI, limited OSS parallelisation |
| Detox for mobile | Rejected | Native build complexity incompatible with Expo managed workflow |
| Maestro for mobile | ✅ Selected | Expo-compatible, simple YAML DSL, cloud device farm |
| Jest for API | Rejected | Already on Vitest; no migration benefit |

## Consequences

- `apps/api` and `apps/mcp` gain `vitest.config.e2e.ts` and an `e2e/` directory with smoke scenarios.
- `apps/web` and `apps/mobile` gain scaffolded `e2e/` directories with placeholder journeys.
- `tools/e2e/` is introduced as a shared e2e environment tooling directory.
- The root `package.json` gains `e2e:smoke` and `e2e` scripts.
- The CI workflow (`ci.yml`) gains a smoke e2e step for API and MCP.
- A new `e2e-full.yml` workflow handles nightly/full-suite runs.
- Playwright and Maestro installation are deferred to follow-up PBIs.
- The legacy `apps/api/test/` and `apps/mcp/test/` directories remain but are superseded by `e2e/`.

## Follow-Up Tasks

1. **Install Playwright** for `apps/web` and migrate placeholder journeys to runnable tests.
2. **Install Maestro** and wire mobile journeys into CI with a simulator.
3. **Implement full auth e2e scenario** for API: login → issue token → use token → revoke token, running against the Firebase emulator.
4. **Implement MCP protocol e2e** using `@modelcontextprotocol/sdk` client utilities for tool-call flows.
5. **Add Dockerfile to `apps/api`** so `docker-compose.e2e.yml` can build and start the API container.
6. **Seed Firebase emulator** with test users for auth e2e flows.
7. **Add nightly e2e workflow** (`e2e-full.yml`) once Playwright and Maestro are installed.
