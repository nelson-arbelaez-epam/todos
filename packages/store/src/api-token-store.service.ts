import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  API_TOKEN_REPOSITORY,
  type ApiTokenEntity,
  type ApiTokenRepository,
  type CreateApiTokenInput,
} from '@todos/core';

@Injectable()
export class ApiTokenStoreService {
  constructor(
    @Optional()
    @Inject(API_TOKEN_REPOSITORY)
    private readonly apiTokenRepository?: ApiTokenRepository,
  ) {}

  /**
   * Persists a new API token record.
   */
  create(input: CreateApiTokenInput): Promise<ApiTokenEntity> {
    return this.getRepository().create(input);
  }

  /**
   * Looks up a token by its SHA-256 hash.
   */
  findByHash(tokenHash: string): Promise<ApiTokenEntity | null> {
    return this.getRepository().findByHash(tokenHash);
  }

  /**
   * Returns all tokens owned by the given Firebase UID, ordered by createdAt DESC.
   */
  findAllByOwner(ownerUid: string): Promise<ApiTokenEntity[]> {
    return this.getRepository().findAllByOwner(ownerUid);
  }

  /**
   * Marks a token as revoked.
   */
  revoke(ownerUid: string, tokenId: string): Promise<ApiTokenEntity | null> {
    return this.getRepository().revoke(ownerUid, tokenId);
  }

  /**
   * Updates the lastUsedAt timestamp (best-effort).
   */
  updateLastUsedAt(tokenId: string): Promise<void> {
    return this.getRepository().updateLastUsedAt(tokenId);
  }

  private getRepository(): ApiTokenRepository {
    if (!this.apiTokenRepository) {
      throw new Error(
        'ApiTokenRepository is not configured. Provide API_TOKEN_REPOSITORY before importing ApiTokenStoreModule.',
      );
    }

    return this.apiTokenRepository;
  }
}
