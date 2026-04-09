import 'reflect-metadata';
import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodosController } from './todos.controller';
import { TodosApiService } from './todos.service';

const mockTodo = {
  id: 'todo-1',
  title: 'Test Todo',
  description: 'A test todo',
  completed: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockTodosApiService = {
  createTodo: vi.fn(),
};

describe('TodosController', () => {
  let controller: TodosController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [
        { provide: TodosApiService, useValue: mockTodosApiService },
      ],
    }).compile();

    controller = module.get<TodosController>(TodosController);
  });

  describe('create', () => {
    it('should create a todo and return success response when token is valid', async () => {
      mockTodosApiService.createTodo.mockResolvedValue(mockTodo);

      const result = await controller.create('valid-firebase-token', {
        title: 'Test Todo',
        description: 'A test todo',
        completed: false,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTodo);
      expect(mockTodosApiService.createTodo).toHaveBeenCalledWith(
        'valid-firebase-token',
        expect.objectContaining({ title: 'Test Todo' }),
      );
    });

    it('should throw UnauthorizedException when api-token header is missing', async () => {
      await expect(
        controller.create(undefined, { title: 'Test Todo' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockTodosApiService.createTodo).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when api-token header is empty string', async () => {
      await expect(
        controller.create('', { title: 'Test Todo' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockTodosApiService.createTodo).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when api-token header is whitespace only', async () => {
      await expect(
        controller.create('   ', { title: 'Test Todo' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockTodosApiService.createTodo).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when body validation fails', async () => {
      await expect(
        controller.create('valid-token', { title: '' } as never),
      ).rejects.toThrow(BadRequestException);

      expect(mockTodosApiService.createTodo).not.toHaveBeenCalled();
    });

    it('should include field-level validation errors in BadRequestException', async () => {
      try {
        await controller.create('valid-token', { title: '' } as never);
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        const response = (err as BadRequestException).getResponse() as {
          errors: Record<string, string[]>;
        };
        expect(response.errors).toHaveProperty('title');
      }

      expect(mockTodosApiService.createTodo).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when API returns 401', async () => {
      const err = Object.assign(new Error('Invalid or expired authentication token'), { status: 401 });
      mockTodosApiService.createTodo.mockRejectedValue(err);

      await expect(
        controller.create('expired-token', { title: 'Test Todo' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return failure response when API call fails with non-auth error', async () => {
      const err = Object.assign(new Error('Service unavailable'), { status: 503 });
      mockTodosApiService.createTodo.mockRejectedValue(err);

      const result = await controller.create('valid-token', { title: 'Test Todo' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Service unavailable');
    });
  });
});
