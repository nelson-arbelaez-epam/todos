import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { TodoEntity } from '@todos/core';
import { OrderDir, TodoOrderBy } from '@todos/core/http';
import { TodoStoreService } from '@todos/store';
import { TodosService } from './todos.service';

const mockTodoStoreService = {
  create: vi.fn(),
  update: vi.fn(),
  findAll: vi.fn(),
  archive: vi.fn(),
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

  describe('update', () => {
    it('should update a todo and return a TodoDto', async () => {
      const entity: TodoEntity = {
        id: 'todo-1',
        title: 'Updated title',
        description: 'Updated description',
        completed: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      mockTodoStoreService.update.mockResolvedValue(entity);

      const dto = {
        title: 'Updated title',
        description: 'Updated description',
        completed: true,
      };
      const result = await service.update('owner-1', 'todo-1', dto);

      expect(result.id).toBe('todo-1');
      expect(result.title).toBe('Updated title');
      expect(result.description).toBe('Updated description');
      expect(result.completed).toBe(true);
      expect(mockTodoStoreService.update).toHaveBeenCalledWith(
        'owner-1',
        'todo-1',
        {
          title: 'Updated title',
          description: 'Updated description',
          completed: true,
        },
      );
    });

    it('should update only the completion status', async () => {
      const entity: TodoEntity = {
        id: 'todo-2',
        title: 'Read a book',
        completed: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      mockTodoStoreService.update.mockResolvedValue(entity);

      const result = await service.update('owner-1', 'todo-2', {
        completed: true,
      });

      expect(result.completed).toBe(true);
    });

    it('should throw NotFoundException when todo is not found', async () => {
      mockTodoStoreService.update.mockResolvedValue(null);

      await expect(
        service.update('owner-1', 'todo-999', { title: 'x' }),
      ).rejects.toThrow(NotFoundException);

      await expect(
        service.update('owner-1', 'todo-999', { title: 'x' }),
      ).rejects.toThrow('Todo with id "todo-999" not found');
    });

    it('should propagate errors from the store', async () => {
      mockTodoStoreService.update.mockRejectedValue(
        new Error('Storage failure'),
      );

      await expect(
        service.update('owner-1', 'todo-1', { title: 'Fail' }),
      ).rejects.toThrow('Storage failure');
    });
  });

  describe('list', () => {
    it('should return a paginated result with defaults', async () => {
      const entities: TodoEntity[] = [
        {
          id: 'todo-1',
          title: 'Buy groceries',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'todo-2',
          title: 'Read a book',
          completed: true,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      mockTodoStoreService.findAll.mockResolvedValue(entities);

      const result = await service.list('owner-1');

      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.items).toHaveLength(2);
      expect(mockTodoStoreService.findAll).toHaveBeenCalledWith('owner-1', {
        includeArchived: false,
      });
    });

    it('should sort by createdAt desc by default', async () => {
      const entities: TodoEntity[] = [
        {
          id: 'todo-1',
          title: 'Older todo',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'todo-2',
          title: 'Newer todo',
          completed: false,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
        },
      ];

      mockTodoStoreService.findAll.mockResolvedValue(entities);

      const result = await service.list('owner-1');

      expect(result.items[0].id).toBe('todo-2');
      expect(result.items[1].id).toBe('todo-1');
    });

    it('should sort by createdAt asc when specified', async () => {
      const entities: TodoEntity[] = [
        {
          id: 'todo-1',
          title: 'Older todo',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'todo-2',
          title: 'Newer todo',
          completed: false,
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
        },
      ];

      mockTodoStoreService.findAll.mockResolvedValue(entities);

      const result = await service.list('owner-1', {
        orderBy: TodoOrderBy.CreatedAt,
        orderDir: OrderDir.Asc,
      });

      expect(result.items[0].id).toBe('todo-1');
      expect(result.items[1].id).toBe('todo-2');
    });

    it('should paginate results correctly', async () => {
      const entities: TodoEntity[] = Array.from({ length: 5 }, (_, i) => ({
        id: `todo-${i + 1}`,
        title: `Todo ${i + 1}`,
        completed: false,
        createdAt: new Date(`2024-01-0${i + 1}`),
        updatedAt: new Date(`2024-01-0${i + 1}`),
      }));

      mockTodoStoreService.findAll.mockResolvedValue(entities);

      const result = await service.list('owner-1', { page: 2, limit: 2 });

      expect(result.total).toBe(5);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(2);
      expect(result.items).toHaveLength(2);
    });

    it('should return an empty items array when there are no active todos', async () => {
      mockTodoStoreService.findAll.mockResolvedValue([]);

      const result = await service.list('owner-1');

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(mockTodoStoreService.findAll).toHaveBeenCalledWith('owner-1', {
        includeArchived: false,
      });
    });

    it('should not include archived todos', async () => {
      const activeEntities: TodoEntity[] = [
        {
          id: 'todo-1',
          title: 'Active todo',
          completed: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockTodoStoreService.findAll.mockResolvedValue(activeEntities);

      const result = await service.list('owner-1');

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('todo-1');
      expect(mockTodoStoreService.findAll).toHaveBeenCalledWith('owner-1', {
        includeArchived: false,
      });
    });

    it('should propagate errors from the store', async () => {
      mockTodoStoreService.findAll.mockRejectedValue(
        new Error('Storage failure'),
      );

      await expect(service.list('owner-1')).rejects.toThrow('Storage failure');
    });
  });

  describe('archive', () => {
    it('should archive a todo and return a TodoDto with archivedAt set', async () => {
      const archivedAt = new Date('2024-02-01');
      const entity: TodoEntity = {
        id: 'todo-1',
        title: 'Buy groceries',
        completed: false,
        archivedAt,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-02-01'),
      };

      mockTodoStoreService.archive.mockResolvedValue(entity);

      const result = await service.archive('owner-1', 'todo-1');

      expect(result.id).toBe('todo-1');
      expect(result.archivedAt).toEqual(archivedAt);
      expect(mockTodoStoreService.archive).toHaveBeenCalledWith(
        'owner-1',
        'todo-1',
      );
    });

    it('should throw NotFoundException when todo is not found', async () => {
      mockTodoStoreService.archive.mockResolvedValue(null);

      await expect(service.archive('owner-1', 'todo-999')).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.archive('owner-1', 'todo-999')).rejects.toThrow(
        'Todo with id "todo-999" not found',
      );
    });

    it('should propagate errors from the store', async () => {
      mockTodoStoreService.archive.mockRejectedValue(
        new Error('Storage failure'),
      );

      await expect(service.archive('owner-1', 'todo-1')).rejects.toThrow(
        'Storage failure',
      );
    });
  });
});
