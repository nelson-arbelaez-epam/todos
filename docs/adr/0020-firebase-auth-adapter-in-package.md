# ADR 0020: Firebase Auth Adapter Extracted to @todos/firebase Package

## Status

Accepted

## Context

Issue [#21](https://github.com/nelson-arbelaez-epam/todos/issues/21) introduced a direct Firebase Admin integration inside `apps/api` (via `FirebaseAdminService` and a local `firebase.module.ts`) to unblock delivery of the auth endpoints. This violated the constitution's **Apps are Composition-Only** principle, which requires that business and infrastructure logic lives in packages.

The `apps/api` layer was responsible for:
- Initialising the Firebase Admin SDK (`FirebaseAdminService`)
- Verifying Firebase ID tokens (inside `FirebaseAuthGuard`)
- Creating Firebase users (inside `AuthService`)

## Decision

Extract all Firebase auth infrastructure from `apps/api` into the `@todos/firebase` package:

1. **`@todos/firebase` `FirebaseAuthService`** is extended with a `createUser()` method and the `verifyIdToken()` return type is tightened to `DecodedIdToken` (from `firebase-admin/auth`).
2. **`apps/api/src/auth/AuthService`** now injects `FirebaseAuthService` from `@todos/firebase` instead of the local `FirebaseAdminService`.
3. **`apps/api/src/auth/FirebaseAuthGuard`** now injects `FirebaseAuthService` from `@todos/firebase` instead of the local `FirebaseAdminService`.
4. **`apps/api/src/auth/AuthModule`** no longer imports a local `FirebaseModule`; it relies on the globally-registered `@todos/firebase` `FirebaseModule` wired in `AppModule`.
5. The `apps/api/src/firebase/` directory (`FirebaseAdminService`, local `FirebaseModule`) is deleted entirely.

## Consequences

- `apps/api` is now composition-only with respect to Firebase auth: it wires NestJS modules and HTTP transport but owns no Firebase SDK initialisation.
- `@todos/firebase` is the single source of truth for Firebase auth operations (`createUser`, `verifyIdToken`, `getUser`).
- Adding future auth operations (e.g. `deleteUser`, `setCustomClaims`) requires changes only in `@todos/firebase`, not in application code.
- All existing auth endpoint contracts (`POST /auth/register`, `POST /auth/login`) and their response shapes are preserved.
- Tests in `apps/api/src/auth/` mock `FirebaseAuthService` (from `@todos/firebase`) directly, validating the package boundary.
