# ADR 0024 - UI Session Context State Management

- Status: Accepted
- Date: 2026-04-11
- Related: GitHub Issue #54; ADR 0021 (UI architecture)

## Context

The web register flow introduced in PR #54 is the first user-auth lifecycle surface in
`apps/web` and highlights the need for a consistent global session context strategy.
The same architectural question also applies to `apps/mobile`, which will need the same
auth/session lifecycle semantics even if its persistence and navigation details differ by
platform.

Session context in this project means client-side auth lifecycle state, for example:

- authenticated or anonymous status
- current user identity snapshot
- access token lifecycle metadata (present, expired, refreshing)
- session hydration and sign-out transitions
- session actions exposed as app-level commands (`register`, `login`, `logout`)

The team requested a spike between three options: Zustand, Redux Toolkit, and TanStack
Query.

Two additional design constraints emerged during the spike:

- UI code should be able to consume a simple selector-based session API such as
  `const register = useSessionStore((state) => state.register)`.
- API transport DTO changes should fail fast in consuming apps at compile time rather than
  being hidden behind `Pick`, `Omit`, or duplicated local interfaces.

## Spike Evaluation Criteria

Weights:

- Session fit (client-owned auth/session state): 35%
- Adoption cost for current codebase: 25%
- Type safety and ergonomics: 20%
- Tooling and debug support: 20%

Scores are from 1 (worst) to 5 (best).

## Options Considered

### Option A - Zustand

Use a focused session store with explicit actions (`setSession`, `clearSession`,
`hydrateSession`) and selectors consumed from hooks and container components.

Pros:

- Minimal boilerplate for a small but global state surface.
- Works well with ADR 0021 container/presentational split because components can consume
  selectors through hooks.
- Naturally supports an action-oriented UI API such as
  `useSessionStore((state) => state.register)` while keeping containers thin.
- Supports persistence middleware for session rehydration without introducing reducers,
  action creators, and slice plumbing.

Cons:

- Fewer guardrails than Redux Toolkit if state surface becomes very large.
- Requires team discipline for store boundaries and selector usage.

Score: 5

### Option B - Redux Toolkit

Use a global Redux store with an auth/session slice, thunks, and provider wiring.

Pros:

- Strong conventions, mature devtools, predictable reducer-based updates.
- Scales well for large cross-domain state graphs.

Cons:

- Higher setup and maintenance overhead than needed for current session scope.
- More ceremony for simple session transitions.
- Adds conceptual complexity before there is evidence of multi-slice global-state demand.

Score: 3

### Option C - TanStack Query

Use query cache and mutations as the primary session source.

Pros:

- Excellent for server-state fetching, caching, invalidation, and background refresh.
- Very useful for todos/resource APIs after auth is established.

Cons:

- Session authority is client-owned state first, not remote cache first.
- Query cache is not a natural source-of-truth for local session transitions such as
  optimistic sign-out, hydration flags, and route guards.
- Would still require a local state mechanism for non-server session flags.

Score: 2

## Weighted Scorecard

| Option | Session fit (35%) | Adoption cost (25%) | Type ergonomics (20%) | Tooling (20%) | Weighted total |
| --- | --- | --- | --- | --- | --- |
| Zustand | 5 | 5 | 4 | 3 | 4.45 |
| Redux Toolkit | 4 | 2 | 4 | 5 | 3.65 |
| TanStack Query | 2 | 4 | 4 | 4 | 3.20 |

## Decision

Adopt Zustand as the standard global session context mechanism for UI apps in this
monorepo.

TanStack Query remains an approved option for server-state concerns (resource fetching,
cache invalidation, background synchronization), but it is not the primary authority for
auth/session lifecycle state.

Redux Toolkit is not selected for the current scope because the additional ceremony is not
justified by present requirements.

### Store and Transport Boundary

The session store is the UI-facing orchestration boundary, not the transport
implementation boundary.

Required layering:

- Components and page containers read selectors and actions from the session store.
- Session store actions orchestrate loading, success, error, hydration, and identity
  transitions.
- HTTP transport remains in dedicated service/client modules that the store calls.

This permits the ergonomic UI usage the team wants:

```ts
const register = useSessionStore((state) => state.register);
```

while preserving transport isolation and testability.

### DTO Contract Rule

When a store action or service represents an API request or response contract, it must use
the canonical DTO types exported from `@todos/core/http` directly.

Allowed:

```ts
register(payload: RegisterUserDto): Promise<RegisterUserResponseDto>
```

Not allowed for transport boundaries:

```ts
type RegisterPayload = Pick<RegisterUserDto, 'email' | 'password'>
interface RegisterResponse { uid: string; email: string }
```

Rationale: the project wants contract drift to surface as compile-time failures in apps if
the DTO changes. Derived transport aliases and duplicated local interfaces weaken that
signal.

UI-only local form models are still allowed before mapping into DTOs, as long as the
service/store API boundary itself uses the canonical DTO type.

### Mobile Scope

This ADR applies to both `apps/web` and `apps/mobile`.

Shared expectations:

- Each UI app owns one session store as the app-level source of truth for auth/session
  lifecycle state.
- The store exposes action-oriented selectors for auth flows (`register`, `login`,
  `logout`, `hydrateSession`).
- Dedicated service/client modules handle HTTP transport.
- API request/response typing at store and service boundaries uses `@todos/core/http`
  DTOs directly.

Platform-specific differences are allowed only in persistence and runtime integration. For
example, web may use browser storage while mobile may use platform-secure storage, but
both must preserve the same store-vs-transport and DTO-boundary rules.

### Session Persistence & Hydration Strategy (Spike Follow-up)

This section defines the implementation strategy for persistence and restoration without
changing backend auth contracts.

#### Persistence adapters by platform

- **Web**: browser storage (for example `localStorage`) is an untrusted, non-secure cache.
  - Do **not** persist sensitive auth/session tokens in browser storage.
  - If persistent token-backed sessions are required on web, migrate to a more secure
    browser-backed approach when possible (for example HttpOnly cookie-backed sessions).
  - Persist only non-sensitive session metadata needed for UX restoration.
  - Use a versioned key (for example `todos-session:v1`) so future schema changes can be
    invalidated safely.
- **Mobile**: use a platform adapter that can be swapped by runtime constraints.
  - Default target is secure platform storage (for example Expo SecureStore) for session
    token-bearing payloads.
  - Keep adapter wiring in app infrastructure and keep session orchestration in the store.

#### Hydration contract and lifecycle

- Keep `hydrateSession` as a store action owned by the session store boundary.
- Hydration lifecycle at app bootstrap:
  1. Read persisted state from the platform adapter.
  2. Validate parsed payload shape against expected DTO fields.
  3. If valid, restore `currentUser`; otherwise clear persisted state and continue signed
     out.
  4. Ensure hydration completion is deterministic before route guards decide navigation.
- Hydration must be idempotent: repeated calls should not duplicate side effects or mutate
  valid state unexpectedly.

#### Logout invalidation and cleanup

- `logout` should always clear in-memory state.
- In the follow-up persistence implementation, `logout` must also remove persisted session
  state via the active platform adapter.
- Logout should also clear store error state so UI does not surface stale auth failures
  after sign-out.
- Any follow-up cross-store cleanup (for example user-scoped cache/state) is triggered by
  container orchestration after logout state transition, not by transport modules.

#### Stale/corrupt persisted-state handling

- Treat persistence input as untrusted.
- Treat all browser storage content as attacker-controlled in XSS scenarios.
- If payload parsing fails, required fields are missing, or persisted schema version is not
  supported, clear persisted data and continue in anonymous state.
- Do not throw uncaught errors from hydration into UI render paths; surface recoverable
  error state only when needed for diagnostics.

#### Test strategy (unit + integration)

- **Unit (store-level)**:
  - verifies `hydrateSession` restores valid state;
  - verifies invalid/corrupt payloads are ignored and cleared;
  - verifies `logout` clears both memory and persistence adapter side effects.
- **Integration (app-level)**:
  - cold start with persisted session routes user to authenticated surface;
  - cold start with corrupt/expired state routes user to login without crashing;
  - logout from authenticated surface removes access to protected routes on next
    navigation/bootstrap.
- Keep shared behavior assertions equivalent across `apps/web` and `apps/mobile`; only the
  persistence adapter implementation differs.

## Consequences

- New session features should build on a single store per app, typically under
  `apps/<ui-app>/src/store/session-store.ts`.
- Container hooks (for example under `src/hooks/`) should be the preferred integration
  point so presentational components remain side-effect free per ADR 0021.
- Session actions are the preferred UI-facing API; transport clients stay in service
  modules and are called by the store rather than directly by presentational components.
- Transport-facing signatures in apps should import request/response DTOs directly from
  `@todos/core/http` to preserve compile-time contract breakage on schema changes.
- If the project later needs broad cross-domain global state beyond session concerns, a
  new ADR must reassess Redux Toolkit adoption.

## Implementation Notes for PR #54 Follow-up

- Introduce a minimal `session-store` slice for auth status, error state, hydration state,
  and user snapshot.
- Expose store actions for `register`, `login`, `logout`, and `hydrateSession`.
- Keep register and login async transport logic in service modules consumed by the store.
- Use `@todos/core/http` DTOs directly at service/store boundaries; avoid `Pick`, `Omit`,
  and duplicated transport interfaces there.
- Drive navigation side effects from page-level containers after store state transitions.
- Apply the same pattern to `apps/mobile`, swapping only the persistence adapter as needed
  for platform constraints.
