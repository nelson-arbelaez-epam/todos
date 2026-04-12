import type { ApiTokenEntity, ApiTokenRepository } from '@todos/core';
import { describe, expect, it, vi } from 'vitest';
import { ApiTokenStoreService } from './api-token-store.service';

const tokenId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const ownerUid = 'firebase-uid-123';

const mockEntity: ApiTokenEntity = {
  tokenId,
  ownerUid,
  label: 'MCP server – production',
  scopes: ['todos:read', 'todos:write'],
  tokenHash: 'sha256hashvalue',
  createdAt: '2026-04-11T13:00:00.000Z',
  expiresAt: '2027-04-11T13:00:00.000Z',
  lastUsedAt: null,
  revokedAt: null,
};

describe('ApiTokenStoreService', () => {
  it('delegates create to repository', async () => {
    const repository: ApiTokenRepository = {
      create: vi.fn().mockResolvedValue(mockEntity),
      findByHash: vi.fn(),
      findAllByOwner: vi.fn(),
      revoke: vi.fn(),
      updateLastUsedAt: vi.fn(),
    };

    const service = new ApiTokenStoreService(repository);
    const input = {
      tokenId,
      ownerUid,
      label: 'MCP server – production',
      scopes: ['todos:read' as const, 'todos:write' as const],
      tokenHash: 'sha256hashvalue',
      expiresAt: '2027-04-11T13:00:00.000Z',
    };
    const result = await service.create(input);

    expect(result).toEqual(mockEntity);
    expect(repository.create).toHaveBeenCalledWith(input);
  });

  it('delegates findByHash to repository', async () => {
    const repository: ApiTokenRepository = {
      create: vi.fn(),
      findByHash: vi.fn().mockResolvedValue(mockEntity),
      findAllByOwner: vi.fn(),
      revoke: vi.fn(),
      updateLastUsedAt: vi.fn(),
    };

    const service = new ApiTokenStoreService(repository);
    const result = await service.findByHash('sha256hashvalue');

    expect(result).toEqual(mockEntity);
    expect(repository.findByHash).toHaveBeenCalledWith('sha256hashvalue');
  });

  it('delegates findAllByOwner to repository', async () => {
    const repository: ApiTokenRepository = {
      create: vi.fn(),
      findByHash: vi.fn(),
      findAllByOwner: vi.fn().mockResolvedValue([mockEntity]),
      revoke: vi.fn(),
      updateLastUsedAt: vi.fn(),
    };

    const service = new ApiTokenStoreService(repository);
    const result = await service.findAllByOwner(ownerUid);

    expect(result).toEqual([mockEntity]);
    expect(repository.findAllByOwner).toHaveBeenCalledWith(ownerUid);
  });

  it('delegates revoke to repository', async () => {
    const revokedEntity: ApiTokenEntity = {
      ...mockEntity,
      revokedAt: '2026-04-11T15:00:00.000Z',
    };
    const repository: ApiTokenRepository = {
      create: vi.fn(),
      findByHash: vi.fn(),
      findAllByOwner: vi.fn(),
      revoke: vi.fn().mockResolvedValue(revokedEntity),
      updateLastUsedAt: vi.fn(),
    };

    const service = new ApiTokenStoreService(repository);
    const result = await service.revoke(ownerUid, tokenId);

    expect(result).toEqual(revokedEntity);
    expect(repository.revoke).toHaveBeenCalledWith(ownerUid, tokenId);
  });

  it('delegates updateLastUsedAt to repository', async () => {
    const repository: ApiTokenRepository = {
      create: vi.fn(),
      findByHash: vi.fn(),
      findAllByOwner: vi.fn(),
      revoke: vi.fn(),
      updateLastUsedAt: vi.fn().mockResolvedValue(undefined),
    };

    const service = new ApiTokenStoreService(repository);
    await service.updateLastUsedAt(tokenId);

    expect(repository.updateLastUsedAt).toHaveBeenCalledWith(tokenId);
  });

  it('throws when repository is not configured', () => {
    const service = new ApiTokenStoreService(undefined);

    expect(() => service.findAllByOwner(ownerUid)).toThrow(
      'ApiTokenRepository is not configured',
    );
  });
});
