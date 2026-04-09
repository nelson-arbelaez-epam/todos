# ADR 0019 - API-Proxied Login via Firebase Identity Toolkit REST API

- Status: Accepted
- Date: 2026-04-09
- Related: GitHub Issue #25, ADR 0018

## Context

ADR 0018 established Firebase Auth + Firestore as the MVP auth and storage solution.
Its original framing assumed clients would call the Firebase Auth SDK directly for sign-in
and token refresh, and that the API would only verify the resulting ID tokens.

However, having clients call Firebase Auth directly has several drawbacks:

- Every client app must bundle or configure the Firebase Web SDK and know the project's
  `FIREBASE_WEB_API_KEY`.
- Auth flows (sign-in, future MFA, rate-limiting, audit logging) are distributed across
  clients and harder to change uniformly.
- The API loses the ability to intercept, enrich, or block auth attempts centrally.
- Future auth provider swaps (e.g., moving away from Firebase Auth) require coordinated
  client-side changes across all apps.

The Firebase Identity Toolkit REST API (`POST accounts:signInWithPassword`) provides the
same email/password sign-in capability that the Firebase Web SDK uses internally, and it
can be called server-side with only the project's Web API key.

## Decision

The API (`apps/api`) exposes a `POST /api/v1/auth/login` endpoint that proxies the
email/password sign-in call to the Firebase Identity Toolkit REST API and returns the
resulting Firebase ID token to the client.

Key points:

- `FIREBASE_WEB_API_KEY` (the non-privileged, project-scoped web key) is stored only on
  the API server and never exposed to clients.
- The API maps Firebase-side error codes (`EMAIL_NOT_FOUND`, `INVALID_PASSWORD`,
  `INVALID_LOGIN_CREDENTIALS`, `USER_DISABLED`) to a generic `401 Unauthorized` response
  so that internal Firebase error details are never leaked to callers.
- Clients receive a standard `{ idToken, email, expiresIn, uid }` payload and use the ID
  token in subsequent API requests for authorization.
- Token refresh remains a client responsibility (Firebase Refresh Token API or SDK) and
  is out of scope for this ADR.
- The Admin SDK (privileged) is not used for sign-in; it is used only for user management
  (registration, user lookup) and Firestore access as specified in ADR 0018.

## Options Evaluated

| Option | Description |
| ------ | ----------- |
| **Clients call Firebase Auth SDK directly** | Original ADR 0018 model. Distributes auth config across clients; harder to add centralized controls. |
| **API proxies via Identity Toolkit REST API** ✅ | Server-side proxy. Centralizes auth, keeps API key server-side, enables uniform logging and future swap. |
| **API implements custom auth (JWT mint)** | Requires custom user store and key management. Highest complexity; rejected for MVP. |

## Weighted Scorecard

Weights:

- Centralisation / future flexibility: 35%
- Security baseline: 30%
- Implementation simplicity: 20%
- Client bundle size / coupling: 15%

Scores are 1 (worst) to 5 (best).

| Option | Centralisation (35%) | Security (30%) | Simplicity (20%) | Client coupling (15%) | Weighted Total |
| --- | --- | --- | --- | --- | --- |
| Client Firebase SDK direct | 2 | 3 | 4 | 2 | 2.65 |
| **API proxy (Identity Toolkit)** | 5 | 4 | 4 | 5 | **4.50** |
| Custom auth / JWT mint | 5 | 3 | 1 | 5 | 3.70 |

Security note: The API proxy scores `4` because it keeps the web API key server-side and
enables centralized error normalization, but the web API key itself is lower-privilege than
the Admin SDK key and its exposure is bounded to the server environment.

## Consequences

- `FIREBASE_WEB_API_KEY` must be provisioned in the API server environment (added to
  `.env.example`).
- Clients no longer need to embed Firebase project configuration for sign-in; they only
  need the API base URL.
- A thin network hop is added (client → API → Firebase Identity Toolkit), which is
  negligible for an auth flow.
- Future auth provider changes (e.g., replace Firebase Auth) require only an API-side
  change; clients are unaffected.
- Token refresh is still the client's responsibility; if a fully server-managed session
  model is required in the future, a dedicated refresh endpoint should be introduced under
  a new ADR.
- This decision supersedes the original ADR 0018 statement that "Clients use Firebase
  Authentication only (sign-in and token refresh)" — sign-in is now API-mediated. Token
  refresh remains client-side for MVP.

## Risks and Mitigations

- **Web API key exposure**: The `FIREBASE_WEB_API_KEY` is a low-privilege project key, not
  an Admin SDK credential. It allows sign-in but cannot access Admin APIs. It must not be
  committed to source control (`.env.example` contains only a placeholder).
- **Firebase Identity Toolkit availability**: The endpoint depends on Firebase's REST API
  being available. Mitigation: rely on Firebase's managed SLA; add observability alerts for
  upstream failures.
- **Rate-limiting**: Firebase enforces its own rate limits on the Identity Toolkit endpoint.
  Future work: add server-side request throttling to the login endpoint before high-traffic
  scenarios.
- **Token refresh not proxied**: Clients must refresh tokens directly via Firebase SDK or
  the Secure Token REST API. If this creates friction, a `/auth/refresh` proxy endpoint can
  be added under a follow-up ADR.

## Tech Debt

The current implementation places `AuthService.login()` (the auth-proxy coordination logic)
directly in `apps/api`, which violates the **Apps are Composition-Only** rule in the
Project Constitution. This was an expedient MVP choice.

**Tracked in [#25](https://github.com/nelson-arbelaez-epam/todos/issues/25)**: the login
proxy logic must be extracted from `apps/api` and moved into the appropriate package
boundary (likely `@todos/firebase` as an auth adapter, or a new dedicated auth package)
so that `apps/api` is reduced back to pure composition and transport wiring.
