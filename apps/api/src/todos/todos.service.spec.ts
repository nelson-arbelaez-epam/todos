import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TodoDtoTransformer, type TodoEntity } from '@todos/dtos';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TodoRepository } from './todo-repository';
import { TodosService } from './todos.service';

describe('TodosService', () => {
  let repository: TodoRepository;
  let service: TodosService;

  beforeEach(() => {
    repository = {
      create: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
    };

    service = new TodosService(repository, new TodoDtoTransformer());
  });

  it('creates a todo from validated payload', async () => {
    const todo: TodoEntity = {
      id: 'todo-1',
      title: 'Trim me',
      completed: false,
      createdAt: new Date('2026-04-05T00:00:00.000Z'),
      updatedAt: new Date('2026-04-05T00:00:00.000Z'),
    };

    vi.mocked(repository.create).mockResolvedValue(todo);

    const result = await service.create({
      title: '  Trim me  ',
    });

    expect(repository.create).toHaveBeenCalledWith({
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
    vi.mocked(repository.archive).mockResolvedValue(null);

    await expect(service.archive('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lists todos with the includeArchived flag', async () => {
    vi.mocked(repository.findAll).mockResolvedValue([
      {
        id: 'todo-1',
        title: 'Visible todo',
        completed: false,
        createdAt: new Date('2026-04-05T00:00:00.000Z'),
        updatedAt: new Date('2026-04-05T00:00:00.000Z'),
      },
    ]);

    const result = await service.findAll(true);

    expect(repository.findAll).toHaveBeenCalledWith({ includeArchived: true });
    expect(result).toHaveLength(1);
  });
});
