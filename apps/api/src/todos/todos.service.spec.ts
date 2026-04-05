import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TodoDtoTransformer, type TodoEntity } from '@todos/core';
import { TodoStoreService } from '@todos/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TodosService } from './todos.service';

describe('TodosService', () => {
  let todoStoreService: TodoStoreService;
  let service: TodosService;

  beforeEach(() => {
    todoStoreService = {
      create: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    } as unknown as TodoStoreService;

    service = new TodosService(todoStoreService, new TodoDtoTransformer());
  });

  it('creates a todo from validated payload', async () => {
    const todo: TodoEntity = {
      id: 'todo-1',
      title: 'Trim me',
      completed: false,
      createdAt: new Date('2026-04-05T00:00:00.000Z'),
      updatedAt: new Date('2026-04-05T00:00:00.000Z'),
    };

    vi.mocked(todoStoreService.create).mockResolvedValue(todo);

    const result = await service.create({
      title: '  Trim me  ',
    });

    expect(todoStoreService.create).toHaveBeenCalledWith('default-owner', {
      title: 'Trim me',
      description: undefined,
      completed: false,
    });
    expect(result.id).toBe('todo-1');
  });

  it('throws bad request for invalid payloads', async () => {
    await expect(
      service.create({
        title: '   ',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws not found when archiving missing todo', async () => {
    vi.mocked(todoStoreService.archive).mockResolvedValue(null);

    await expect(service.archive('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lists todos with the includeArchived flag', async () => {
    vi.mocked(todoStoreService.findAll).mockResolvedValue([
      {
        id: 'todo-1',
        title: 'Visible todo',
        completed: false,
        createdAt: new Date('2026-04-05T00:00:00.000Z'),
        updatedAt: new Date('2026-04-05T00:00:00.000Z'),
      },
    ]);

    const result = await service.findAll(true);

    expect(todoStoreService.findAll).toHaveBeenCalledWith('default-owner', {
      includeArchived: true,
    });
    expect(result).toHaveLength(1);
  });
});
