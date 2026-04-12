# ADR 0022 - Long-Lived API Token Strategy

- Status: Accepted
- Date: 2026-04-11
- Related: GitHub Issue #37; ADR 0018, ADR 0019, ADR 0020 (MCP transport)

## Context

The existing auth architecture (ADR 0018, ADR 0019) issues short-lived Firebase ID tokens
(1-hour TTL) that clients obtain by calling `POST /api/v1/auth/login`. The MCP server
(`apps/mcp`) forwards these tokens to the API as `Bearer` credentials.

A 1-hour TTL is incompatible with an always-on MCP server. The MCP server runs as a
background process and cannot interactively re-authenticate the user on expiry. Attempting
to persist or auto-refresh Firebase ID tokens server-side re-introduces the web API key to
non-browser contexts and weakens the proxied-login model defined in ADR 0019.

A dedicated long-lived API token facility is therefore required. It must:

- Survive across MCP server restarts without interactive re-authentication.
- Be independently revocable (compromise or rotation must not require changing the user's
  Firebase password or affecting any other session).
- Carry enough metadata for audit, scoping, and future fine-grained access control.
- Integrate with the existing `FirebaseAuthGuard` request pipeline without replacing it.

## Decision

Introduce an opaque long-lived API token facility backed by Firestore, reusing existing
package boundaries.

### 1. Token Format

Tokens are **opaque random strings**, not JWTs. The raw token value is:

```
todos_<32 cryptographically random bytes encoded as base64url>
```

Example: `todos_dGhpcyBpcyBhIHRlc3QgdG9rZW4gZm9yIHRlc3Q`

Rationale for opaque over JWT:

- Long-lived JWTs cannot be revoked without a server-side blocklist, effectively
  requiring the same server round-trip as opaque token lookup.
- Opaque tokens make revocation a simple Firestore write (set `revokedAt`).
- Self-contained JWTs expose algorithm, issuer, and scope claims in the token body,
  increasing information leakage if a token is intercepted.
- The `todos_` prefix enables unambiguous detection: a guard can recognise an API token
  before attempting Firebase JWT verification.

### 2. Token Storage

| Field | Type | Description |
| --- | --- | --- |
| `tokenId` | `string` (UUID v4) | Stable public identifier; safe to return in listings and audit logs |
| `ownerUid` | `string` | Firebase UID of the token owner |
| `label` | `string` | Human-readable name provided at issuance (e.g., "MCP server – production") |
| `scopes` | `string[]` | Granted permission scopes (see §5 below) |
| `tokenHash` | `string` | SHA-256 hex digest of the raw token; the raw token is never persisted |
| `createdAt` | `Timestamp` | Firestore server timestamp at issuance |
| `expiresAt` | `Timestamp \| null` | Optional expiry; `null` means no hard expiration |
| `lastUsedAt` | `Timestamp \| null` | Updated on every successful validation (best-effort write) |
| `revokedAt` | `Timestamp \| null` | Set when the token is revoked; `null` means active |

Firestore collection path: `api_tokens/{tokenId}`.

The `tokenHash` field is indexed (single-field ascending) to support constant-time hash
lookup during request validation. Firestore documents are also accessible by `ownerUid`
via a composite index to support listing a user's own tokens.

**Raw token is returned exactly once** — in the `POST /api/v1/auth/tokens` response body.
It is never stored, never returned again, and never logged in plaintext.

### 3. Hashing and Comparison

- Algorithm: **SHA-256** (no salt required; the raw token carries ≥ 256 bits of entropy,
  making brute-force attacks against the hash computationally infeasible).
- Comparison: Lookup is hash-equality on a Firestore query
  (`where('tokenHash', '==', hash)`), which is inherently constant-time in that context.
- The raw token and its hash **must never appear in application logs**. Log the `tokenId`
  and `ownerUid` instead.

### 4. Issuance Flow

```
Client (authenticated)         API                          Firestore
      |                         |                               |
      |-- POST /auth/tokens -->>|                               |
      |   (Bearer: Firebase JWT)|                               |
      |                         |-- verify Firebase JWT ----->>|
      |                         |<< uid extracted               |
      |                         |                               |
      |                         |-- generate 32 random bytes    |
      |                         |-- prefix "todos_"             |
      |                         |-- SHA-256(rawToken)           |
      |                         |                               |
      |                         |-- write api_tokens doc ---->>|
      |                         |   { tokenId, ownerUid, label, |
      |                         |     scopes, tokenHash,        |
      |                         |     createdAt, expiresAt:null,|
      |                         |     lastUsedAt:null,          |
      |                         |     revokedAt:null }          |
      |                         |<< doc written                 |
      |                         |                               |
      |<< 201 { tokenId,        |                               |
      |   token (raw, once),    |                               |
      |   label, scopes,        |                               |
      |   createdAt, expiresAt }|                               |
```

### 5. Scopes

Initial scope set (extend as new resources are added):

| Scope | Grants |
| --- | --- |
| `todos:read` | Read own todos |
| `todos:write` | Create and update own todos |
| `todos:delete` | Archive and delete own todos |

The issuance endpoint accepts only scopes that the requesting Firebase-authenticated user
is authorised to hold; a user cannot self-escalate beyond their current permissions.

Implementation note (2026-04-11): The current implementation enforces allowed scope values
and API-token route scope checks, but does not yet map Firebase-authenticated callers to a
fine-grained entitlement model at token issuance time. Future role- or policy-based auth
implementations must enforce caller-to-scope entitlement at issuance (rejecting
out-of-entitlement scope requests) before expanding authorization capabilities.

Scope validation during token lookup: the request-handling code checks that the resolved
token's `scopes` array includes the required scope for the requested resource before
permitting the action.

Scope requirements are declared with a dedicated `@AuthScope(...)` route decorator.
Conceptually, this behaves as a public-endpoint wrapper layer that executes
post-authentication and pre-request-handler (after identity is resolved, before the
controller/service method runs). The wrapper is evaluated only when the resolved auth
provider is non-Firebase (currently long-lived API tokens). Firebase-authenticated
requests are not blocked by `@AuthScope` and continue to rely on existing Firebase JWT
validation.

### 6. Request Validation Flow

The existing `FirebaseAuthGuard` is extended to recognise API tokens in the `Authorization:
Bearer` header by inspecting the `todos_` prefix:

```
Incoming request
      |
      |-- extract Authorization: Bearer <value>
      |
      |-- value starts with "todos_"?
      |       YES → compute SHA-256(value)
      |               query Firestore: tokenHash == hash AND revokedAt == null
      |               check expiresAt (if set, reject if past)
      |               attach { uid: ownerUid, scopes, tokenId } to request.user
      |               best-effort update lastUsedAt
      |       NO  → attempt Firebase verifyIdToken(value) (existing path)
      |
      |-- neither path succeeds → 401 Unauthorized
```

The guard change is additive: existing Firebase ID token flows are unaffected. The
`request.user` interface is extended to carry an optional `apiTokenId` and `scopes` field
alongside the existing `DecodedIdToken` shape.

During request handling, the auth layer resolves `authProvider`, then applies the
`@AuthScope` wrapper only when `authProvider !== 'firebase'`. For API-token requests,
missing required scopes result in `403 Forbidden`; for Firebase requests, scope metadata
is ignored by design in this ADR.

### 7. Listing Tokens

`GET /api/v1/auth/tokens` returns an array of `ApiTokenMetadataDto` objects for the
authenticated user. The `tokenHash` field is **never** included in API responses.

### 8. Revocation

`DELETE /api/v1/auth/tokens/:tokenId` sets `revokedAt` to the current server timestamp in
the Firestore document. The operation is idempotent. Revoked tokens are rejected
immediately on the next request (the guard checks `revokedAt == null` on every lookup).

### 9. Rotation Model

Rotation is **manual and caller-driven**:

1. Caller issues a new token (`POST /api/v1/auth/tokens`).
2. Caller updates its configuration to use the new token.
3. Caller revokes the old token (`DELETE /api/v1/auth/tokens/:tokenId`).

There is no automatic rotation or token families for MVP. A future ADR may introduce
time-based rotation reminders or automatic short-window refresh tokens if needed.

### 10. Expiration

Default `expiresAt`: **365 days** from issuance. The requester may request a shorter
expiry (minimum 1 day). No-expiry tokens (`expiresAt: null`) are allowed but must be
explicitly opted into by passing `expiresInDays: null` in the request body, and their
use should be audited.

### 11. Transport Security

- API tokens **must only be transmitted over HTTPS** in production.
- The `Authorization: Bearer` header is the required transport mechanism; the `x-api-token`
  header used by the MCP app for Firebase tokens will be updated to use standard Bearer
  authorization.
- Tokens must not be included in URL query strings or log bodies.

### 12. Audit Expectations

- Every issuance event is logged at `INFO` level with `{ tokenId, ownerUid, label, scopes,
  expiresAt }`.
- Every revocation event is logged at `INFO` level with `{ tokenId, ownerUid }`.
- Token validation failures (invalid hash, expired, revoked) are logged at `WARN` level
  with `{ reason }` — never including the raw token value.
- `lastUsedAt` is updated on each successful validation (best-effort; a failed write does
  not reject the request).

## Options Evaluated

| Option | Description |
| --- | --- |
| **Re-use Firebase ID tokens with manual refresh** | Requires persisting the Firebase refresh token on the MCP server and periodically calling the token refresh endpoint. Couples MCP server to Firebase refresh logic; refresh token compromise has wider blast radius. |
| **Long-lived Firebase Custom Tokens** | Firebase custom tokens are JWTs minted by Admin SDK but must be exchanged for an ID token (1-hour TTL) via the REST API — no benefit over re-using the existing login flow. |
| **Opaque random API tokens stored in Firestore** ✅ | Simple, independently revocable, no Firebase SDK dependency on the client, fits existing Firestore/Admin SDK architecture. |
| **Self-signed JWT API tokens** | Requires key management (rotation, storage) in the API. No easier to revoke than opaque tokens; adds complexity for negligible benefit given the server-side validation model. |

## Weighted Scorecard

Weights:

- Revocability / blast-radius containment: 35%
- Implementation simplicity: 25%
- Fit with existing architecture: 25%
- Client simplicity: 15%

Scores are 1 (worst) to 5 (best).

| Option | Revocability (35%) | Simplicity (25%) | Arch fit (25%) | Client (15%) | Weighted Total |
| --- | --- | --- | --- | --- | --- |
| Firebase ID token + refresh | 2 | 3 | 4 | 3 | 2.90 |
| Firebase Custom Tokens | 2 | 3 | 3 | 3 | 2.65 |
| **Opaque API tokens (Firestore)** | 5 | 4 | 5 | 5 | **4.75** |
| Self-signed JWT API tokens | 3 | 2 | 3 | 4 | 2.95 |

## Required DTOs

Defined in `@todos/core/http`:

| DTO | Direction | Fields |
| --- | --- | --- |
| `CreateApiTokenDto` | Request | `label: string`, `scopes: string[]`, `expiresInDays: number \| null` |
| `ApiTokenResponseDto` | Response (issuance only) | `tokenId`, `token` (raw, once), `label`, `scopes`, `createdAt`, `expiresAt \| null` |
| `ApiTokenMetadataDto` | Response (list / info) | `tokenId`, `label`, `scopes`, `createdAt`, `expiresAt \| null`, `lastUsedAt \| null`, `revokedAt \| null` |
| `RevokeApiTokenResponseDto` | Response (revocation) | `tokenId`, `revokedAt` |

## Required Firestore Fields

Firestore collection `api_tokens`, document ID = `tokenId` (UUID v4):

```
{
  tokenId:     string,   // UUID v4; document ID
  ownerUid:    string,   // Firebase UID
  label:       string,
  scopes:      string[],
  tokenHash:   string,   // SHA-256 hex digest; single-field index
  createdAt:   Timestamp,
  expiresAt:   Timestamp | null,
  lastUsedAt:  Timestamp | null,
  revokedAt:   Timestamp | null
}
```

Composite index for listing: `(ownerUid ASC, createdAt DESC)`.

## Endpoint Impacts

| Endpoint | Change |
| --- | --- |
| `POST /api/v1/auth/tokens` | **New** — issue a long-lived API token (authenticated) |
| `GET /api/v1/auth/tokens` | **New** — list caller's active tokens, metadata only |
| `DELETE /api/v1/auth/tokens/:tokenId` | **New** — revoke a token |
| `FirebaseAuthGuard` | **Extended** — recognise `todos_` prefix and perform Firestore hash lookup before falling back to Firebase JWT verification |
| `@AuthScope(...scopes)` decorator | **New** — declares route scope requirements enforced only for non-Firebase auth providers |
| All existing endpoints | **Unchanged** — Firebase ID token auth continues to work |

## Security Constraints Summary

| Concern | Constraint |
| --- | --- |
| Transport | HTTPS only; `Authorization: Bearer` header |
| Storage | SHA-256 hash only; raw token never persisted |
| Logging | Log `tokenId`/`ownerUid`; never log raw token or hash |
| Entropy | 32 cryptographically random bytes (256 bits); SHA-256 hash is collision-resistant at this entropy level without a salt |
| Comparison | Hash equality via Firestore query; no timing-attack risk at this level |
| Revocation | Firestore `revokedAt` field; checked on every request |
| Expiration | Configurable; default 365 days; enforced on every request |
| Scope isolation | Each token carries explicit scopes; checked via `@AuthScope` for non-Firebase auth providers |

## Consequences

- `@todos/core` gains four new DTOs in the `http` subpath.
- `@todos/firebase` gains an `ApiTokenRepository` implementation (follow-up task).
- `apps/api/auth` gains three new endpoint handlers and an extended guard (follow-up task).
- `apps/api/auth` gains `@AuthScope` metadata handling for non-Firebase providers.
- The MCP server must be updated to forward a long-lived API token instead of a short-lived
  Firebase ID token (follow-up task).
- A new Firestore collection (`api_tokens`) is required; no migration of existing data.
- `firestore.rules` must be updated to deny direct client reads/writes of `api_tokens`
  (server-side only, consistent with the existing todo storage model).
- Future work: token rotation reminders, per-scope usage metrics, admin revocation UI.

## Follow-Up Tasks

1. **Implement `ApiTokenRepository`** in `@todos/firebase` with `create`, `findByHash`,
   `findAllByOwner`, and `revoke` methods.
2. **Extend `FirebaseAuthGuard`** (or add `ApiTokenAuthGuard` + composite) to perform
   Firestore hash lookup for `todos_`-prefixed tokens.
3. **Add `@AuthScope` decorator support** and enforce it only for requests authenticated
  through non-Firebase providers.
4. **Implement `ApiTokensController`** in `apps/api` (`POST`, `GET`,
   `DELETE /api/v1/auth/tokens`).
5. **Update MCP server** to accept a long-lived API token via environment variable and
   forward it as `Authorization: Bearer <token>` instead of `x-api-token`.
6. **Update Firestore rules** to block direct client access to `api_tokens`.
7. **Update `apps/api` README** with new token issuance and revocation docs.
