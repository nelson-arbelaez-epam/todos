import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import type { ValidationError } from '../validators';
import {
  CreateTodoDtoValidator,
  TodoDtoTransformer,
  UpdateTodoDtoValidator,
} from './index';

describe('HTTP Todo Validators', () => {
  describe('CreateTodoDtoValidator', () => {
    const validator = new CreateTodoDtoValidator();

    it('should validate a valid CreateTodoDto', async () => {
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

    it('should trim title whitespace', async () => {
      const data = {
        title: '  Test Todo  ',
      };

      const result = await validator.validate(data);
      expect(result.title).toBe('Test Todo');
    });

    it('should throw ValidationError for missing title', async () => {
      const data = {
        description: 'Test description',
      };

      try {
        await validator.validate(data);
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect((error as ValidationError).errors.title).toBeDefined();
        expect((error as ValidationError).name).toBe('ValidationError');
      }
    });

    it('should throw ValidationError for empty title', async () => {
      const data = {
        title: '   ',
      };

      try {
        await validator.validate(data);
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect((error as ValidationError).errors.title).toBeDefined();
        expect((error as ValidationError).name).toBe('ValidationError');
      }
    });

    it('should allow optional fields', async () => {
      const data = {
        title: 'Test Todo',
      };

      const result = await validator.validate(data);
      expect(result.title).toBe('Test Todo');
      expect(result.description).toBeUndefined();
      expect(result.completed).toBeUndefined();
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

  describe('UpdateTodoDtoValidator', () => {
    const validator = new UpdateTodoDtoValidator();

    it('should validate a valid UpdateTodoDto', async () => {
      const data = {
        title: 'Updated Todo',
        completed: true,
      };

      const result = await validator.validate(data);
      expect(result.title).toBe('Updated Todo');
      expect(result.completed).toBe(true);
    });

    it('should allow all empty objects', async () => {
      const data = {};

      const result = await validator.validate(data);
      expect(result).toEqual({});
    });

    it('should throw ValidationError for empty title', async () => {
      const data = {
        title: '   ',
      };

      try {
        await validator.validate(data);
        expect.fail('Should have thrown ValidationError');
      } catch (error) {
        expect((error as ValidationError).errors.title).toBeDefined();
        expect((error as ValidationError).name).toBe('ValidationError');
      }
    });

    it('should return true for valid data', async () => {
      const data = {
        title: 'Updated Todo',
        completed: true,
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
});

describe('HTTP Todo Transformer', () => {
  const transformer = new TodoDtoTransformer();

  it('should transform entity to TodoDto', () => {
    const entity = {
      id: '1',
      title: 'Test Todo',
      description: 'Test description',
      completed: true,
      archivedAt: new Date('2024-01-03'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    };

    const result = transformer.transform(entity);
    expect(result.id).toBe('1');
    expect(result.title).toBe('Test Todo');
    expect(result.description).toBe('Test description');
    expect(result.completed).toBe(true);
    expect(result.archivedAt).toBeInstanceOf(Date);
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

  it('should default completed to false if undefined', () => {
    const entity = {
      id: '1',
      title: 'Test Todo',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = transformer.transform(entity);
    expect(result.completed).toBe(false);
  });
});
