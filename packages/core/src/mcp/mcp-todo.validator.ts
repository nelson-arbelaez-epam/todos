import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationError } from '../validators';
import { MCPCreateTodoRequest, MCPUpdateTodoRequest } from './mcp-todo.dto';

/**
 * Validator for MCP Create Todo Request using class-validator
 */
export class MCPCreateTodoDtoValidator {
  async validate(data: unknown): Promise<MCPCreateTodoRequest> {
    const dto = plainToInstance(MCPCreateTodoRequest, data);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const errorMap: Record<string, string[]> = {};
      errors.forEach((error) => {
        const property = error.property;
        const constraints = error.constraints;
        if (constraints) {
          errorMap[property] = Object.values(constraints);
        }
      });
      throw new ValidationError('Validation failed', errorMap);
    }

    return dto;
  }

  async isValid(data: unknown): Promise<boolean> {
    try {
      await this.validate(data);
      return true;
    } catch (_error) {
      return false;
    }
  }
}

/**
 * Validator for MCP Update Todo Request using class-validator
 */
export class MCPUpdateTodoDtoValidator {
  async validate(data: unknown): Promise<MCPUpdateTodoRequest> {
    const dto = plainToInstance(MCPUpdateTodoRequest, data);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const errorMap: Record<string, string[]> = {};
      errors.forEach((error) => {
        const property = error.property;
        const constraints = error.constraints;
        if (constraints) {
          errorMap[property] = Object.values(constraints);
        }
      });
      throw new ValidationError('Validation failed', errorMap);
    }

    return dto;
  }

  async isValid(data: unknown): Promise<boolean> {
    try {
      await this.validate(data);
      return true;
    } catch (_error) {
      return false;
    }
  }
}
