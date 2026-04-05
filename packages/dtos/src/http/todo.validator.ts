import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationError } from '../validators';
import { CreateTodoDto, UpdateTodoDto } from './todo.dto';

/**
 * Validator for CreateTodoDto using class-validator
 */
export class CreateTodoDtoValidator {
  async validate(data: unknown): Promise<CreateTodoDto> {
    const dto = plainToInstance(CreateTodoDto, data);
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
 * Validator for UpdateTodoDto using class-validator
 */
export class UpdateTodoDtoValidator {
  async validate(data: unknown): Promise<UpdateTodoDto> {
    const dto = plainToInstance(UpdateTodoDto, data);
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
