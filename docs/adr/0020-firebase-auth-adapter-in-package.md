# ADR 0020 - Firebase Admin Auth Adapter in @todos/firebase

- Status: Accepted
- Date: 2026-04-09
- Related: GitHub Issues #21, #25; ADR 0019

## Context

Issue [#25](https://github.com/nelson-arbelaez-epam/todos/issues/25) tracks the refactor to move Firebase auth integration out of `apps/api` and back behind a package boundary.

That refactor exists because issue [#21](https://github.com/nelson-arbelaez-epam/todos/issues/21) originally introduced Firebase-backed auth endpoints quickly by placing Firebase Admin wiring directly inside `apps/api`.

That temporary shape added two application-layer responsibilities that do not belong in an app module under the project constitution:

- Initialising the Firebase Admin SDK in `apps/api`
- Hosting Firebase Admin-backed auth operations such as user creation and ID token verification inside application-local services/modules

This created a package-boundary violation because Admin SDK infrastructure is reusable platform capability, not transport composition.

ADR 0019 remains separately responsible for the login decision: the API proxies email/password sign-in through the Firebase Identity Toolkit REST API. This ADR covers where that Firebase auth coordination lives inside the codebase.

## Decision

Move Firebase auth infrastructure out of `apps/api` and into `@todos/firebase`.

Concretely:

1. `@todos/firebase` owns Firebase Admin bootstrapping and the Nest module that exposes it.
2. `@todos/firebase/FirebaseAuthService` owns Firebase auth capabilities used by the API boundary, including `createUser()`, login proxy coordination, `getUser()`, and `verifyIdToken()`.
3. `apps/api` consumes `FirebaseAuthService` from `@todos/firebase` for registration, login, and token verification rather than creating local Firebase wrappers.
4. The local `apps/api/src/firebase/` implementation is removed.
5. `apps/api` remains responsible only for HTTP transport wiring, request/response mapping, and guard/controller composition.

## Consequences

- `apps/api` no longer owns Firebase auth coordination or local Firebase adapters.
- `@todos/firebase` becomes the single source of truth for Firebase auth operations used by the API.
- Future Admin capabilities such as `deleteUser()` or `setCustomClaims()` can be added in one place without reintroducing app-layer SDK wiring.
- The constitution no longer needs an exception for auth-specific app-layer Firebase coordination; the standing rule remains generic and ADR-backed.
- Existing auth endpoint contracts remain unchanged while the internal package boundary is improved.
- Tests in `apps/api/src/auth/` should mock `FirebaseAuthService` from `@todos/firebase`, validating the dependency direction.
