# ADR 0023 - API Scaffolding: Separating HTTP Modules from Application Logic

- Status: Accepted
- Date: 2026-04-11
- Related: GitHub Issue #53; ADR 0020 (Firebase auth adapter), ADR 0022 (long-lived API token strategy)

## Context

The `apps/api` NestJS application currently organises each feature as a single flat folder containing every file type: controllers, services, guards, parameter decorators, and their tests. The `auth` module is the clearest example:

```
apps/api/src/auth/
  auth.controller.ts         ← HTTP transport (routes, Swagger decorators, request/response mapping)
  auth.controller.spec.ts
  auth.service.ts            ← application logic (calls FirebaseAuthService)
  auth.service.spec.ts
  firebase-auth.guard.ts     ← HTTP guard (reads Authorization header, writes request.user)
  firebase-auth.guard.spec.ts
  current-user.decorator.ts  ← HTTP parameter decorator (@CurrentUser())
  auth.module.ts             ← NestJS module wiring
```

### Pain Points

1. **Blurred responsibility boundaries.** Controllers, guards, and parameter decorators are
   pure HTTP-transport concerns; services contain application logic; yet all files live at
   the same directory level with no visual or structural distinction.

2. **Growing auth module.** ADR 0022 adds three new HTTP endpoints (`POST`, `GET`,
   `DELETE /api/v1/auth/tokens`) and a new `@AuthScope` decorator to the auth module. A
   flat folder for a seven-file module becomes very crowded at ten or more files and harder
   to navigate.

3. **Cross-module HTTP coupling.** `TodosController` imports `CurrentUser` directly from
   `../auth/current-user.decorator`. A parameter decorator is HTTP infrastructure; it should
   not be coupled to the `auth` feature folder from the consumer's perspective.

4. **Test discoverability.** When all spec files live in the same folder as the source, it
   is harder to quickly assess which layer (HTTP vs application) a failing test covers.

5. **Scalability for future modules.** As new features are added, every module will
   reproduce this flat pattern, making the overall `apps/api/src/` tree progressively harder
   to navigate.

### Constitution Alignment

The Project Constitution states: *"Apps are Composition-Only: code under `apps/**` must wire
modules, expose transport endpoints, and host runtime configuration only."* The current
structure technically satisfies this constraint but does not enforce the distinction
*within* the app between transport and wiring code. Making the boundary explicit in the
folder layout reinforces the constitution at a structural level.

## Options Evaluated

### Option A – Feature module with `http/` submodule (per-feature HTTP boundary)

Each feature module keeps its own folder. Inside that folder, a dedicated `http/`
subdirectory groups all HTTP-transport files. Application-logic files remain at the module
root.

```
apps/api/src/auth/
  auth.module.ts                        ← NestJS module wiring (unchanged location)
  auth.service.ts                       ← application logic
  auth.service.spec.ts
  http/                                 ← HTTP transport boundary
    auth.controller.ts
    auth.controller.spec.ts
    api-tokens.controller.ts            ← (ADR 0022)
    api-tokens.controller.spec.ts
    decorators/
      current-user.decorator.ts
      auth-scope.decorator.ts           ← (ADR 0022)
    guards/
      firebase-auth.guard.ts
      firebase-auth.guard.spec.ts
```

**Trade-offs:**

| Concern | Assessment |
| --- | --- |
| Clarity | ✅ HTTP files are immediately distinguishable from application logic |
| Discoverability | ✅ New team members find guard/decorator locations predictably |
| Migration cost | ✅ Low — one folder per module; no cross-module restructuring |
| Module boundaries | ✅ Feature cohesion is preserved inside each module folder |
| Test clarity | ✅ Spec files stay co-located with their source at the right layer |
| Cross-module import path | ⚠️ Consumers must reference `http/decorators/` path (one level deeper) |
| NestJS conventions | ✅ Compatible; NestJS does not mandate flat folders |

### Option B – Global horizontal layer split

All HTTP-transport files across all modules are moved into a shared `http/` folder at the
`apps/api/src/` root; all application services live in a `services/` folder; module
definitions live in `modules/`.

```
apps/api/src/
  http/
    controllers/
      auth.controller.ts
      todos.controller.ts
    guards/
      firebase-auth.guard.ts
    decorators/
      current-user.decorator.ts
  services/
    auth.service.ts
    todos.service.ts
  modules/
    auth.module.ts
    todos.module.ts
```

**Trade-offs:**

| Concern | Assessment |
| --- | --- |
| HTTP/logic separation | ✅ Hard structural boundary between all HTTP and all service files |
| Feature cohesion | ❌ Auth-related files are now spread across three top-level folders; context-switching is high |
| Migration cost | ❌ High — every import path changes; all modules must be restructured at once |
| Discoverability | ❌ Adding a new auth feature requires editing files in three separate locations |
| NestJS conventions | ⚠️ Diverges from NestJS community convention of feature-based folder structure |
| Test organisation | ❌ Tests lose co-location benefit; test files in controllers/ test services in services/ |
| Constitution fit | ⚠️ Technically valid but reduces feature-level cohesion the constitution does not mandate sacrificing |

### Option C – Namespaced flat module (no subfolder; naming convention only)

Keep the flat folder structure but enforce a filename prefix convention:
- `http.*.ts` for controllers, guards, and decorators
- `*.service.ts` for application logic
- `*.module.ts` for module wiring

```
apps/api/src/auth/
  auth.module.ts
  auth.service.ts
  auth.service.spec.ts
  http.auth.controller.ts
  http.auth.controller.spec.ts
  http.firebase-auth.guard.ts
  http.firebase-auth.guard.spec.ts
  http.current-user.decorator.ts
```

**Trade-offs:**

| Concern | Assessment |
| --- | --- |
| Migration cost | ✅ Minimal — rename files; no new directories |
| HTTP/logic separation | ⚠️ Visual distinction only; no structural boundary enforced by the filesystem |
| Discoverability | ⚠️ Works in small modules; benefits disappear when modules grow to many files |
| Tooling support | ⚠️ No standard NestJS or TypeScript tooling enforces the naming convention |
| Scalability | ❌ As module size grows, the flat directory becomes cluttered again |
| Long-term value | ❌ Convention drift is common; naming rules erode without structural enforcement |

## Decision

**Adopt Option A: per-feature `http/` submodule.**

Rationale:

1. **Lowest migration cost** — each module can be refactored independently, one at a time,
   without touching other modules.
2. **Feature cohesion is preserved** — all auth-related code stays inside `auth/`; all
   todos-related code stays inside `todos/`. Feature boundaries are discoverable.
3. **Structural enforcement** — the filesystem itself communicates the HTTP/application
   boundary, unlike the naming-convention approach (Option C).
4. **Aligns with ADR 0022 growth** — the auth module will gain multiple controllers,
   multiple decorators, and a guard extension. The `http/` subfolder absorbs this growth
   without cluttering the module root.
5. **NestJS idiomatic** — NestJS projects with complex modules routinely use subdirectories;
   this does not diverge from ecosystem conventions.

### Cross-Module HTTP Utilities

Parameter decorators and guards that are consumed by multiple feature modules (`@CurrentUser`,
`@AuthScope`, `FirebaseAuthGuard`) should migrate out of `auth/http/` into a shared
location to remove the cross-module coupling identified in the pain points:

```
apps/api/src/shared/http/
  decorators/
    current-user.decorator.ts
    auth-scope.decorator.ts
  guards/
    firebase-auth.guard.ts
    firebase-auth.guard.spec.ts
```

The `FirebaseAuthGuard` is already re-exported from `AuthModule` and consumed globally via
`APP_GUARD`. The decorator and guard files moving to `shared/http/` does not change the
NestJS module wiring; it only clarifies that these artefacts are infrastructure shared by
all modules rather than belonging exclusively to the auth feature.

## Target Structure

### `auth` module (example)

```
apps/api/src/auth/
  auth.module.ts                         ← imports AuthHttpModule; exports FirebaseAuthGuard
  auth.service.ts                        ← application logic; calls FirebaseAuthService
  auth.service.spec.ts
  http/
    auth-http.module.ts                  ← registers AuthController, ApiTokensController
    auth.controller.ts                   ← POST /auth/register, POST /auth/login
    auth.controller.spec.ts
    api-tokens.controller.ts             ← POST/GET/DELETE /auth/tokens (ADR 0022)
    api-tokens.controller.spec.ts
```

### `todos` module

```
apps/api/src/todos/
  todos.module.ts                        ← imports TodosHttpModule
  todos.service.ts                       ← application logic
  todos.service.spec.ts
  http/
    todos-http.module.ts                 ← registers TodosController
    todos.controller.ts
    todos.controller.spec.ts
```

### Shared HTTP infrastructure

```
apps/api/src/shared/
  http/
    decorators/
      current-user.decorator.ts
      auth-scope.decorator.ts            ← (ADR 0022, added when implemented)
    guards/
      firebase-auth.guard.ts
      firebase-auth.guard.spec.ts
  shared-http.module.ts                  ← exports FirebaseAuthGuard (used by AppModule)
```

### Full tree (target)

```
apps/api/src/
  app.controller.ts
  app.controller.spec.ts
  app.module.ts
  app.service.ts
  main.ts
  auth/
    auth.module.ts
    auth.service.ts
    auth.service.spec.ts
    http/
      auth-http.module.ts
      auth.controller.ts
      auth.controller.spec.ts
      api-tokens.controller.ts           ← ADR 0022
      api-tokens.controller.spec.ts
  todos/
    todos.module.ts
    todos.service.ts
    todos.service.spec.ts
    http/
      todos-http.module.ts
      todos.controller.ts
      todos.controller.spec.ts
  shared/
    http/
      decorators/
        current-user.decorator.ts
        auth-scope.decorator.ts          ← ADR 0022
      guards/
        firebase-auth.guard.ts
        firebase-auth.guard.spec.ts
    shared-http.module.ts
```

## Naming Conventions

| Artefact | Convention | Example |
| --- | --- | --- |
| HTTP submodule | `<feature>-http.module.ts` | `auth-http.module.ts` |
| Shared HTTP module | `shared-http.module.ts` | `shared-http.module.ts` |
| Controller | `<resource>.controller.ts` | `auth.controller.ts` |
| Guard | `<name>.guard.ts` | `firebase-auth.guard.ts` |
| Decorator | `<name>.decorator.ts` | `current-user.decorator.ts` |
| Application service | `<feature>.service.ts` | `auth.service.ts` |

Controllers, guards, and decorators live in `http/` (or `shared/http/`).  
Services live at the module root.  
Module wiring files (`*.module.ts`) live at the module root.

## Incremental Migration Strategy

The migration is deliberately incremental: each step is independently deployable and does
not block other work.

### Step 1 — Establish shared HTTP infrastructure (auth module)

1. Create `apps/api/src/shared/http/guards/` and move `firebase-auth.guard.ts` and its
   spec there.
2. Create `apps/api/src/shared/http/decorators/` and move `current-user.decorator.ts` there.
3. Create `apps/api/src/shared/shared-http.module.ts` that provides and exports
   `FirebaseAuthGuard`.
4. Update `AppModule` to import `SharedHttpModule` instead of re-exporting the guard from
   `AuthModule`.
5. Update all import paths referencing the moved files (`TodosController`,
   `FirebaseAuthGuard` usages in `AppModule`).
6. Run `yarn workspace @todos/api test` to verify no regressions.

### Step 2 — Introduce `http/` submodule in `auth`

1. Create `apps/api/src/auth/http/`.
2. Move `auth.controller.ts` and `auth.controller.spec.ts` into `auth/http/`.
3. Create `auth/http/auth-http.module.ts` that declares `AuthController`.
4. Update `auth.module.ts` to import `AuthHttpModule` instead of declaring `AuthController`
   directly.
5. Update import paths inside the moved controller.
6. Run `yarn workspace @todos/api test`.

### Step 3 — Introduce `http/` submodule in `todos`

1. Create `apps/api/src/todos/http/`.
2. Move `todos.controller.ts` and `todos.controller.spec.ts` into `todos/http/`.
3. Create `todos/http/todos-http.module.ts`.
4. Update `todos.module.ts`.
5. Update import paths.
6. Run `yarn workspace @todos/api test`.

### Step 4 — Add ADR 0022 artefacts in the new locations (follow-up PBIs)

- `ApiTokensController` lands in `auth/http/`.
- `@AuthScope` decorator lands in `shared/http/decorators/`.
- Guard extension for `todos_`-prefixed tokens lands in `shared/http/guards/`.

Each step can be completed in isolation. No step requires a coordinated migration of the
entire codebase.

## Risks and Rollback Considerations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Import path breakage after file moves | Medium | Run the full test suite (`yarn workspace @todos/api test`) after each step; TypeScript compiler errors surface missing updates immediately |
| Team unfamiliarity with new convention | Low | This ADR and updated constitution section serve as the reference; code review enforces the pattern |
| NestJS DI misconfiguration after moving guards | Low | Guards moved out of `AuthModule` must be re-declared in `SharedHttpModule`; existing unit tests for `FirebaseAuthGuard` catch wiring errors |
| Scope creep during migration | Medium | Scope each migration step as a dedicated PBI; do not combine Steps 1-3 in a single PR |
| Rollback | N/A | File moves are non-breaking to runtime behaviour; any step can be reverted by reverting the associated commit without affecting other steps |

## Consequences

- `apps/api` gains a `shared/` folder for HTTP infrastructure used across multiple feature
  modules.
- Each feature module gains an `http/` subfolder for its transport layer.
- `current-user.decorator.ts` and `firebase-auth.guard.ts` will no longer be coupled to the
  `auth` feature folder from consumers' perspectives.
- Import paths referencing `../auth/current-user.decorator` will be updated to
  `../shared/http/decorators/current-user.decorator` (one-time, tracked in migration Step 1).
- No endpoint behaviour changes. No DTO changes. No NestJS module registration changes that
  affect runtime routing.
- The constitution is updated to reference this ADR for API module structure guidance.
- Future modules (e.g., a `users` module) must follow the same `http/` submodule pattern
  from the outset.

## Follow-Up PBIs

1. **Execute migration Step 1** — move shared HTTP infrastructure (guard, decorator) to
   `shared/http/`.
2. **Execute migration Step 2** — introduce `http/` submodule in `auth`.
3. **Execute migration Step 3** — introduce `http/` submodule in `todos`.
4. **Implement ADR 0022 artefacts** using the new structure (Steps 4+ are already scoped in
   ADR 0022 follow-up tasks).
5. **Update constitution** API Architecture section to reference this ADR and the naming
   conventions table.
