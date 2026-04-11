import { Test } from '@nestjs/testing';
import { API_TOKEN_REPOSITORY, type ApiTokenRepository } from '@todos/core';
import { describe, expect, it, vi } from 'vitest';
import { ApiTokenStoreModule } from './api-token-store.module';
import { ApiTokenStoreService } from './api-token-store.service';

describe('ApiTokenStoreModule', () => {
  it('provides ApiTokenStoreService with injected ApiTokenRepository', async () => {
    const repository: ApiTokenRepository = {
      create: vi.fn(),
      findByHash: vi.fn(),
      findAllByOwner: vi.fn(),
      revoke: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [ApiTokenStoreModule],
      providers: [{ provide: API_TOKEN_REPOSITORY, useValue: repository }],
    }).compile();

    const storeService = moduleRef.get(ApiTokenStoreService);

    expect(storeService).toBeDefined();
  });
});
