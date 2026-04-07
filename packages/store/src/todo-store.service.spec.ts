import type { TodoEntity, TodoRepository } from '@todos/core';
import { describe, expect, it, vi } from 'vitest';
import { TodoStoreService } from './todo-store.service';

describe('TodoStoreService', () => {
  it('delegates create to repository', async () => {
    const createdTodo: TodoEntity = {
      id: 'todo-1',
      title: 'Title',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const repository: TodoRepository = {
      create: vi.fn().mockResolvedValue(createdTodo),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
      delete: vi.fn(),
    };

    const service = new TodoStoreService(repository);
    const result = await service.create('owner-1', { title: 'Title' });

    expect(result).toEqual(createdTodo);
    expect(repository.create).toHaveBeenCalledWith('owner-1', {
      title: 'Title',
    });
  });

  it('throws when repository is not configured', () => {
    const service = new TodoStoreService(undefined);

    expect(() => service.findAll('owner-1')).toThrow(
      'TodoRepository is not configured',
    );
  });

  it('delegates findById/update/delete to repository', async () => {
    const repository: TodoRepository = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findAll: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockResolvedValue(null),
      archive: vi.fn().mockResolvedValue(null),
      delete: vi.fn().mockResolvedValue(true),
    };

    const service = new TodoStoreService(repository);

    await expect(service.findById('owner-1', 'todo-1')).resolves.toBeNull();
    await expect(
      service.findAll('owner-1', { includeArchived: true }),
    ).resolves.toEqual([]);
    await expect(
      service.update('owner-1', 'todo-1', { completed: true }),
    ).resolves.toBeNull();
    await expect(service.archive('owner-1', 'todo-1')).resolves.toBeNull();
    await expect(service.delete('owner-1', 'todo-1')).resolves.toBe(true);

    expect(repository.findById).toHaveBeenCalledWith('owner-1', 'todo-1');
    expect(repository.findAll).toHaveBeenCalledWith('owner-1', {
      includeArchived: true,
    });
    expect(repository.update).toHaveBeenCalledWith('owner-1', 'todo-1', {
      completed: true,
    });
    expect(repository.archive).toHaveBeenCalledWith('owner-1', 'todo-1');
    expect(repository.delete).toHaveBeenCalledWith('owner-1', 'todo-1');
  });
});
