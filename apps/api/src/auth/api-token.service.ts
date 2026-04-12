import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import type { CreateApiTokenInput } from '@todos/core';
import type { ApiTokenResponseDto, CreateApiTokenDto } from '@todos/core/http';
import { ApiTokenStoreService } from '@todos/store';

/** Default token lifetime when the caller does not specify one. */
const DEFAULT_EXPIRES_IN_DAYS = 365;

/** Prefix that identifies an opaque long-lived API token (ADR 0022). */
const TOKEN_PREFIX = 'todos_';

/**
 * Generates and persists long-lived opaque API tokens (ADR 0022).
 *
 * The raw token is returned exactly once – at issuance – and is never stored.
 * Only the SHA-256 hex digest of the raw token is persisted in Firestore.
 */
@Injectable()
export class ApiTokenService {
  private readonly logger = new Logger(ApiTokenService.name);

  constructor(private readonly apiTokenStore: ApiTokenStoreService) {}

  /**
   * Issues a new long-lived API token for the authenticated user.
   *
   * @param ownerUid - Firebase UID of the requesting user
   * @param dto - Token creation request payload
   * @returns The raw token (once only) plus metadata
   */
  async createToken(
    ownerUid: string,
    dto: CreateApiTokenDto,
  ): Promise<ApiTokenResponseDto> {
    const tokenId = randomUUID();
    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = this.resolveExpiresAt(dto.expiresInDays);

    const input: CreateApiTokenInput = {
      tokenId,
      ownerUid,
      label: dto.label,
      scopes: dto.scopes,
      tokenHash,
      expiresAt,
    };

    const entity = await this.apiTokenStore.create(input);

    this.logger.log(
      `API token issued: tokenId=${entity.tokenId} ownerUid=${entity.ownerUid} label="${entity.label}" scopes=${JSON.stringify(entity.scopes)} expiresAt=${entity.expiresAt ?? 'never'}`,
    );

    return {
      tokenId: entity.tokenId,
      token: rawToken,
      label: entity.label,
      scopes: entity.scopes,
      createdAt: entity.createdAt,
      expiresAt: entity.expiresAt,
    };
  }

  /**
   * Generates a cryptographically random opaque token with the `todos_` prefix.
   * Format: `todos_<32 random bytes encoded as base64url>`
   */
  private generateRawToken(): string {
    const bytes = randomBytes(32);
    const encoded = bytes
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    return `${TOKEN_PREFIX}${encoded}`;
  }

  /**
   * Computes the SHA-256 hex digest of the raw token.
   * The digest is what is stored; the raw token is never persisted.
   */
  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Resolves the `expiresAt` ISO string from the caller-supplied `expiresInDays`.
   *
   * - `undefined` (omitted) → defaults to `DEFAULT_EXPIRES_IN_DAYS`
   * - `null` (explicit) → non-expiring token; returns `null`
   * - number → token expires after that many days
   */
  private resolveExpiresAt(
    expiresInDays: number | null | undefined,
  ): string | null {
    if (expiresInDays === null) {
      return null;
    }

    const days = expiresInDays ?? DEFAULT_EXPIRES_IN_DAYS;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt.toISOString();
  }
}
