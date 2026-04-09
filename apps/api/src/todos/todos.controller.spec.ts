import { BadRequestException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

const mockTodosService = {
  create: vi.fn(),
};

const mockUser: Partial<DecodedIdToken> = { uid: 'user-123' };

describe('TodosController', () => {
  let controller: TodosController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [{ provide: TodosService, useValue: mockTodosService }],
    }).compile();

    controller = module.get<TodosController>(TodosController);
  });

  describe('create', () => {
    it('should create a todo and return the TodoDto', async () => {
      const todoDto = {
        id: 'todo-1',
        title: 'Buy groceries',
        description: 'Milk and eggs',
        completed: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockTodosService.create.mockResolvedValue(todoDto);

      const dto = { title: 'Buy groceries', description: 'Milk and eggs' };
      const result = await controller.create(
        mockUser as DecodedIdToken,
        dto as never,
      );

      expect(result).toEqual(todoDto);
      expect(mockTodosService.create).toHaveBeenCalledWith('user-123', dto);
    });

    it('should propagate BadRequestException for invalid payload', async () => {
      mockTodosService.create.mockRejectedValue(
        new BadRequestException('Validation failed'),
      );

      await expect(
        controller.create(mockUser as DecodedIdToken, { title: '' } as never),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
