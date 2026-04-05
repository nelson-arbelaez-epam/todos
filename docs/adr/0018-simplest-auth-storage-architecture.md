# ADR 0018 - Simplest Auth + Storage Architecture for MVP

- Status: Accepted (MVP)
- Date: 2026-04-05
- Related: GitHub Issue #18

## Context

The repository already includes Firebase project configuration in `apps/api/firebase.json` with Firestore and Authentication providers enabled. Firestore rules in `apps/api/firestore.rules` now deny all client reads and writes.

MVP requires:

- User authentication
- Todo storage
- Low operational overhead
- Fast implementation

Evaluated options:

1. Firebase Auth + Firestore (managed)
2. Custom lightweight auth server + DB
3. Keycloak + DB

## Decision

Use Firebase Auth + Firestore for MVP with backend-only data access:

- Clients use Firebase Authentication only (sign-in and token refresh).
- Clients do not read/write Firestore directly.
- API endpoints use Firebase Admin SDK for all Firestore reads/writes.
- API verifies Firebase ID tokens and applies authorization before data access.
- Anonymous authentication is not enabled for MVP. Only email/password and Google sign-in tokens are accepted.

If anonymous auth is reintroduced later, the API must explicitly reject anonymous tokens or assign a separate guest scope. MVP does neither; it disables the provider entirely.

## Weighted Scorecard

Weights:

- Simplicity: 40%
- Time to production: 25%
- Security baseline out-of-the-box: 20%
- Cost/ops overhead: 15%

Scores are 1 (worst) to 5 (best).

| Option | Simplicity (40%) | Time (25%) | Security OOTB (20%) | Cost/Ops (15%) | Weighted Total |
| --- | --- | --- | --- | --- | --- |
| Firebase Auth + Firestore | 5 | 5 | 4 | 4 | 4.65 |
| Custom auth server + DB | 3 | 2 | 2 | 2 | 2.40 |
| Keycloak + DB | 1 | 1 | 4 | 1 | 1.60 |

Security scoring note:

- Firebase Auth + Firestore scores `4` because it has a strong managed baseline, but that score depends on the API correctly verifying Firebase ID tokens and enforcing authorization on every endpoint.
- Keycloak + DB scores `4` for a different reason: mature standards support and battle-tested identity capabilities, but with materially higher implementation and operations cost.
- The equal score does not mean equivalent delivery risk. Firebase is operationally simpler for MVP, while Keycloak is stronger as a standalone identity platform.

## Validation Against Current Repo

- Firebase configuration exists at `apps/api/firebase.json`:
  - Firestore database configured with rules and indexes files.
  - Auth providers enabled: email/password and Google Sign-In.
- Firestore rules file exists at `apps/api/firestore.rules` and now denies all client reads/writes.
- API application does not yet include Firebase Admin SDK dependencies or auth token verification wiring, so implementation work remains for next sprint.

Conclusion: Firebase path is already scaffolded and is the shortest path to MVP once secure rules and API integration are completed.

## Minimum Secure Firestore Rules Baseline (Prototype)

Because all data access is routed through trusted backend endpoints, Firestore client access should be fully denied.

Prototype rules:

```rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Notes:

- This deny-all baseline is appropriate when the API is the only data plane.
- Firebase Admin SDK bypasses Firestore rules by design in trusted server contexts.
- Rules should still be validated in emulator tests before deployment.

## Migration / Exit Strategy (If Firebase Chosen First)

Design boundary now:

- Keep domain interfaces in shared packages (DTO/entity contracts already exist).
- Introduce a storage abstraction in API (for example, `TodoRepository`).
- Isolate Firebase-specific code in one infrastructure adapter module.

Migration path later:

1. Add a second adapter (for example, Postgres) implementing the same repository contract.
2. Run dual-write or export/import migration from Firestore.
3. Switch API dependency injection from Firebase adapter to new adapter.
4. Decommission Firebase data path once parity and validation are complete.

## Risks and Mitigations

- Vendor lock-in risk.
  - Mitigation: repository/service abstraction boundary and migration-ready data contract.
- Misconfigured security rules risk.
  - Mitigation: emulator rule tests and deny-by-default policy.
- Cost growth with unbounded reads.
  - Mitigation: query constraints, indexes, and pagination defaults; revisit architecture and usage budgets if sustained load exceeds roughly 1,000 daily active users or Firestore spend becomes non-trivial relative to MVP hosting costs.
- Auth/session misuse across clients.
  - Mitigation: verify Firebase ID tokens in API for privileged operations.
- Token revocation and clock skew are not explicitly handled in MVP.
  - Mitigation: rely on short-lived ID tokens initially, and add revocation checks plus bounded clock-skew handling once privileged operations or elevated threat scenarios justify the extra latency and implementation cost.

## Done In This PR

1. Replace permissive Firestore rules with deny-all client rules.
2. Remove anonymous auth from Firebase configuration.
3. Document backend-only Firestore access via API and Firebase Admin SDK.

## Do Now / Do Later Plan

Do now (next sprint):

1. Add Firestore security rule tests in emulator (assert client reads/writes are denied).
2. Implement Firebase auth flow in clients (sign-in plus token refresh only).
3. Verify Firebase ID token in API and map identity to request context.
4. Implement Todo repository adapter in API using Firebase Admin SDK.
5. Enforce user-scoped authorization in API service layer for every todo operation.
6. Add observability for auth/storage errors.

Do later:

1. Add role-based access extensions (if multi-user/shared lists are introduced).
2. Add backup/export automation and restoration drills.
3. Evaluate multi-region and advanced index optimization.
4. Add alternate storage adapter proof-of-concept to reduce lock-in risk.

## Consequences

- MVP delivery is accelerated with managed auth/data services.
- Direct database exposure from clients is removed, improving baseline security posture.
- API becomes the single policy enforcement point and must maintain strong authorization checks.
- Team accepts Firebase coupling in the short term.
- Architectural seams are required now to keep migration feasible later.
