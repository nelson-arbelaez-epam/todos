import { Test } from '@nestjs/testing';
import { TODO_REPOSITORY, type TodoRepository } from '@todos/core';
import { describe, expect, it, vi } from 'vitest';
import { TodoStoreModule } from './todo-store.module';
import { TodoStoreService } from './todo-store.service';

describe('TodoStoreModule', () => {
  it('provides TodoStoreService with injected TodoRepository', async () => {
    const repository: TodoRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      archive: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [TodoStoreModule],
      providers: [{ provide: TODO_REPOSITORY, useValue: repository }],
    }).compile();

    const storeService = moduleRef.get(TodoStoreService);

    expect(storeService).toBeDefined();
  });
});
