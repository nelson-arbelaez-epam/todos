import type { ApiTokenScope } from '../http/api-token.dto';

/**
 * Firestore document shape for an API token (stored in the `api_tokens` collection).
 * The raw token value is never stored; only its SHA-256 hex digest is persisted.
 */
export interface ApiTokenEntity {
  /** UUID v4; also the Firestore document ID */
  tokenId: string;
  /** Firebase UID of the token owner */
  ownerUid: string;
  /** Human-readable label */
  label: string;
  /** Granted permission scopes */
  scopes: ApiTokenScope[];
  /** SHA-256 hex digest of the raw token; never returned to callers */
  tokenHash: string;
  /** ISO timestamp of issuance */
  createdAt: string;
  /** ISO timestamp of expiration, or null for no expiration */
  expiresAt: string | null;
  /** ISO timestamp of last successful use, or null if never used */
  lastUsedAt: string | null;
  /** ISO timestamp of revocation, or null if still active */
  revokedAt: string | null;
}

export interface CreateApiTokenInput {
  /** UUID v4; used as the Firestore document ID */
  tokenId: string;
  ownerUid: string;
  label: string;
  scopes: ApiTokenScope[];
  tokenHash: string;
  expiresAt: string | null;
}

/**
 * Repository contract for managing long-lived API tokens.
 * Implementations live in @todos/firebase (Firestore-backed).
 */
export interface ApiTokenRepository {
  /**
   * Persists a new API token record.
   * Returns the full entity (excluding tokenHash in API responses).
   */
  create(input: CreateApiTokenInput): Promise<ApiTokenEntity>;

  /**
   * Looks up a token by its SHA-256 hash.
   * Returns null if no matching token exists.
   */
  findByHash(tokenHash: string): Promise<ApiTokenEntity | null>;

  /**
   * Returns all tokens owned by the given Firebase UID, ordered by createdAt DESC.
   */
  findAllByOwner(ownerUid: string): Promise<ApiTokenEntity[]>;

  /**
   * Marks a token as revoked by setting its revokedAt timestamp.
   * Returns the updated entity, or null if the tokenId does not exist
   * or belongs to a different owner.
   */
  revoke(ownerUid: string, tokenId: string): Promise<ApiTokenEntity | null>;

  /**
   * Updates the lastUsedAt timestamp to now (best-effort; failures are ignored by callers).
   */
  updateLastUsedAt(tokenId: string): Promise<void>;
}

export const API_TOKEN_REPOSITORY = Symbol('API_TOKEN_REPOSITORY');
