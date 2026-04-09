import { Test, type TestingModule } from '@nestjs/testing';
import type { TodoEntity } from '@todos/core';
import { TodoStoreService } from '@todos/store';
import { TodosService } from './todos.service';

const mockTodoStoreService = {
  create: vi.fn(),
};

describe('TodosService', () => {
  let service: TodosService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        { provide: TodoStoreService, useValue: mockTodoStoreService },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
  });

  describe('create', () => {
    it('should create a todo and return a TodoDto', async () => {
      const entity: TodoEntity = {
        id: 'todo-1',
        title: 'Buy groceries',
        description: 'Milk and eggs',
        completed: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockTodoStoreService.create.mockResolvedValue(entity);

      const dto = { title: 'Buy groceries', description: 'Milk and eggs' };
      const result = await service.create('owner-1', dto);

      expect(result.id).toBe('todo-1');
      expect(result.title).toBe('Buy groceries');
      expect(result.description).toBe('Milk and eggs');
      expect(result.completed).toBe(false);
      expect(mockTodoStoreService.create).toHaveBeenCalledWith('owner-1', {
        title: 'Buy groceries',
        description: 'Milk and eggs',
        completed: undefined,
      });
    });

    it('should default completed to false when not provided', async () => {
      const entity: TodoEntity = {
        id: 'todo-2',
        title: 'Read a book',
        completed: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockTodoStoreService.create.mockResolvedValue(entity);

      const result = await service.create('owner-1', { title: 'Read a book' });

      expect(result.completed).toBe(false);
    });

    it('should propagate errors from the store', async () => {
      mockTodoStoreService.create.mockRejectedValue(
        new Error('Storage failure'),
      );

      await expect(
        service.create('owner-1', { title: 'Fail' }),
      ).rejects.toThrow('Storage failure');
    });
  });
});
