# ADR 0018 - Simplest Auth + Storage Architecture for MVP

- Status: Accepted (MVP)
- Date: 2026-04-05
- Related: GitHub Issue #18

## Context

The repository already includes Firebase project configuration in `apps/api/firebase.json` with Firestore and Authentication providers enabled. Firestore rules in `apps/api/firestore.rules` are currently temporary and permissive.

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

## Validation Against Current Repo

- Firebase configuration exists at `apps/api/firebase.json`:
  - Firestore database configured with rules and indexes files.
  - Auth providers enabled: email/password and Google Sign-In.
- Firestore rules file exists at `apps/api/firestore.rules` and now denies all client reads/writes.
- API application does not yet include Firebase runtime SDK dependencies or auth token verification wiring, so implementation work remains for next sprint.

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
  - Mitigation: query constraints, indexes, and pagination defaults.
- Auth/session misuse across clients.
  - Mitigation: verify Firebase ID tokens in API for privileged operations.

## Do Now / Do Later Plan

Do now (next sprint):

1. Replace permissive Firestore rules with deny-all client rules.
2. Add Firestore security rule tests in emulator (assert client reads/writes are denied).
3. Implement Firebase auth flow in clients (sign-in plus token refresh only).
4. Verify Firebase ID token in API and map identity to request context.
5. Implement Todo repository adapter in API using Firebase Admin SDK.
6. Enforce user-scoped authorization in API service layer for every todo operation.
7. Add observability for auth/storage errors.

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
