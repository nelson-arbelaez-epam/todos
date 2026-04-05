import { describe, expect, it } from 'vitest';
import { ValidationError } from './validators';

describe('ValidationError', () => {
  it('should create a ValidationError with message and errors', () => {
    const error = new ValidationError('Validation failed', {
      title: ['Title is required'],
      description: ['Description must be a string'],
    });

    expect(error.message).toBe('Validation failed');
    expect(error.name).toBe('ValidationError');
    expect(error.errors).toEqual({
      title: ['Title is required'],
      description: ['Description must be a string'],
    });
  });

  it('should create a ValidationError with empty errors by default', () => {
    const error = new ValidationError('Some error');

    expect(error.message).toBe('Some error');
    expect(error.errors).toEqual({});
  });
});
