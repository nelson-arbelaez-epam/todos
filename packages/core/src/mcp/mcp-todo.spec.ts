import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import { ValidationError } from '../validators';
import {
  MCPCreateTodoDtoValidator,
  MCPTodoDtoTransformer,
  MCPUpdateTodoDtoValidator,
} from './index';

describe('MCP Todo Validators', () => {
  describe('MCPCreateTodoDtoValidator', () => {
    const validator = new MCPCreateTodoDtoValidator();

    it('should validate a valid MCP create todo request', async () => {
      const data = {
        title: 'Test Todo',
        description: 'Test description',
        completed: false,
      };

      const result = await validator.validate(data);
      expect(result.title).toBe('Test Todo');
      expect(result.description).toBe('Test description');
      expect(result.completed).toBe(false);
    });

    it('should throw ValidationError for missing title', async () => {
      const data = {
        description: 'Test description',
      };

      await expect(validator.validate(data)).rejects.toThrow(ValidationError);
    });

    it('should trim title whitespace', async () => {
      const data = {
        title: '  Test Todo  ',
      };

      const result = await validator.validate(data);
      expect(result.title).toBe('Test Todo');
    });

    it('should return true for valid data', async () => {
      const data = {
        title: 'Test Todo',
        description: 'Test description',
        completed: false,
      };

      const result = await validator.isValid(data);
      expect(result).toBe(true);
    });

    it('should return false for invalid data', async () => {
      const data = {
        title: '',
      };

      const result = await validator.isValid(data);
      expect(result).toBe(false);
    });
  });

  describe('MCPUpdateTodoDtoValidator', () => {
    const validator = new MCPUpdateTodoDtoValidator();

    it('should validate a valid MCP update todo request', async () => {
      const data = {
        id: '123',
        title: 'Updated Todo',
        completed: true,
      };

      const result = await validator.validate(data);
      expect(result.id).toBe('123');
      expect(result.title).toBe('Updated Todo');
      expect(result.completed).toBe(true);
    });

    it('should throw ValidationError for missing id', async () => {
      const data = {
        title: 'Updated Todo',
      };

      await expect(validator.validate(data)).rejects.toThrow(ValidationError);
    });

    it('should allow partial updates', async () => {
      const data = {
        id: '123',
        completed: true,
      };

      const result = await validator.validate(data);
      expect(result.id).toBe('123');
      expect(result.completed).toBe(true);
      expect(result.title).toBeUndefined();
    });

    it('should return true for valid data', async () => {
      const data = {
        id: '123',
        title: 'Updated Todo',
        completed: true,
      };

      const result = await validator.isValid(data);
      expect(result).toBe(true);
    });

    it('should return false for invalid data', async () => {
      const data = {
        title: 'Updated Todo',
      };

      const result = await validator.isValid(data);
      expect(result).toBe(false);
    });
  });
});

describe('MCP Todo Transformer', () => {
  const transformer = new MCPTodoDtoTransformer();

  it('should transform entity to MCPTodoDto with ISO dates', () => {
    const entity = {
      id: '1',
      title: 'Test Todo',
      description: 'Test description',
      completed: true,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
    };

    const result = transformer.transform(entity);
    expect(result.id).toBe('1');
    expect(result.title).toBe('Test Todo');
    expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(result.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('should transform many entities', () => {
    const entities = [
      {
        id: '1',
        title: 'Todo 1',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Todo 2',
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const results = transformer.transformMany(entities);
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('1');
    expect(results[1].id).toBe('2');
  });
});
