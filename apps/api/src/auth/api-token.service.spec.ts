import { Test, type TestingModule } from '@nestjs/testing';
import type { ApiTokenEntity } from '@todos/core';
import { API_TOKEN_REPOSITORY } from '@todos/core';
import type { CreateApiTokenDto } from '@todos/core/http';
import { ApiTokenService } from './api-token.service';

const mockTokenRepository = {
  create: vi.fn(),
  findByHash: vi.fn(),
  findAllByOwner: vi.fn(),
  revoke: vi.fn(),
};

const ownerUid = 'firebase-uid-123';

const mockEntity: ApiTokenEntity = {
  tokenId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  ownerUid,
  label: 'MCP server – production',
  scopes: ['todos:read', 'todos:write'],
  tokenHash: 'sha256hashvalue',
  createdAt: '2026-04-11T13:00:00.000Z',
  expiresAt: '2027-04-11T13:00:00.000Z',
  lastUsedAt: null,
  revokedAt: null,
};

describe('ApiTokenService', () => {
  let service: ApiTokenService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiTokenService,
        { provide: API_TOKEN_REPOSITORY, useValue: mockTokenRepository },
      ],
    }).compile();

    service = module.get<ApiTokenService>(ApiTokenService);
  });

  describe('createToken', () => {
    it('should return an ApiTokenResponseDto with the raw token on success', async () => {
      mockTokenRepository.create.mockResolvedValue(mockEntity);

      const dto: CreateApiTokenDto = {
        label: 'MCP server – production',
        scopes: ['todos:read', 'todos:write'],
      };

      const result = await service.createToken(ownerUid, dto);

      expect(result.tokenId).toBe(mockEntity.tokenId);
      expect(result.label).toBe(mockEntity.label);
      expect(result.scopes).toEqual(mockEntity.scopes);
      expect(result.createdAt).toBe(mockEntity.createdAt);
      expect(result.expiresAt).toBe(mockEntity.expiresAt);
      // Raw token must start with 'todos_'
      expect(result.token).toMatch(/^todos_/);
    });

    it('should pass a tokenId, ownerUid, label, scopes, tokenHash, and expiresAt to the repository', async () => {
      mockTokenRepository.create.mockResolvedValue(mockEntity);

      const dto: CreateApiTokenDto = {
        label: 'Test token',
        scopes: ['todos:read'],
        expiresInDays: 30,
      };

      await service.createToken(ownerUid, dto);

      expect(mockTokenRepository.create).toHaveBeenCalledOnce();
      const input = mockTokenRepository.create.mock.calls[0][0];

      expect(input.tokenId).toBeTruthy();
      expect(input.ownerUid).toBe(ownerUid);
      expect(input.label).toBe('Test token');
      expect(input.scopes).toEqual(['todos:read']);
      expect(input.tokenHash).toBeTruthy();
      // tokenHash must be 64 hex chars (SHA-256)
      expect(input.tokenHash).toMatch(/^[0-9a-f]{64}$/);
      // expiresAt must be an ISO string roughly 30 days in the future
      expect(input.expiresAt).not.toBeNull();
    });

    it('should store SHA-256 hash, not the raw token', async () => {
      mockTokenRepository.create.mockResolvedValue(mockEntity);

      const dto: CreateApiTokenDto = {
        label: 'Test token',
        scopes: ['todos:read'],
      };

      const result = await service.createToken(ownerUid, dto);

      const input = mockTokenRepository.create.mock.calls[0][0];
      expect(input.tokenHash).not.toBe(result.token);
    });

    it('should default to 365 days expiry when expiresInDays is omitted', async () => {
      mockTokenRepository.create.mockResolvedValue(mockEntity);

      const dto: CreateApiTokenDto = {
        label: 'Test token',
        scopes: ['todos:read'],
      };

      await service.createToken(ownerUid, dto);

      const input = mockTokenRepository.create.mock.calls[0][0];
      const expiresAt = new Date(input.expiresAt as string);
      const expectedMin = new Date();
      expectedMin.setDate(expectedMin.getDate() + 364);
      const expectedMax = new Date();
      expectedMax.setDate(expectedMax.getDate() + 366);

      expect(expiresAt.getTime()).toBeGreaterThan(expectedMin.getTime());
      expect(expiresAt.getTime()).toBeLessThan(expectedMax.getTime());
    });

    it('should set expiresAt to null when expiresInDays is null (non-expiring)', async () => {
      const nonExpiringEntity: ApiTokenEntity = {
        ...mockEntity,
        expiresAt: null,
      };
      mockTokenRepository.create.mockResolvedValue(nonExpiringEntity);

      const dto: CreateApiTokenDto = {
        label: 'Non-expiring token',
        scopes: ['todos:read'],
        expiresInDays: null,
      };

      await service.createToken(ownerUid, dto);

      const input = mockTokenRepository.create.mock.calls[0][0];
      expect(input.expiresAt).toBeNull();
    });

    it('should propagate repository errors', async () => {
      mockTokenRepository.create.mockRejectedValue(
        new Error('Firestore unavailable'),
      );

      const dto: CreateApiTokenDto = {
        label: 'Test token',
        scopes: ['todos:read'],
      };

      await expect(service.createToken(ownerUid, dto)).rejects.toThrow(
        'Firestore unavailable',
      );
    });

    it('should generate a unique token on each call', async () => {
      mockTokenRepository.create.mockResolvedValue(mockEntity);

      const dto: CreateApiTokenDto = {
        label: 'Test token',
        scopes: ['todos:read'],
      };

      const result1 = await service.createToken(ownerUid, dto);
      const result2 = await service.createToken(ownerUid, dto);

      expect(result1.token).not.toBe(result2.token);
    });
  });
});
