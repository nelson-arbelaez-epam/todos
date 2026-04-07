import { plainToInstance } from 'class-transformer';
import { TodoDto } from './todo.dto';
import type { TodoEntity } from './todo.entity';

/**
 * Entity-to-DTO transformer using class-transformer
 */
export class TodoDtoTransformer {
  transform(entity: TodoEntity): TodoDto {
    // Ensure default values are set
    const normalizedEntity = {
      ...entity,
      completed: entity.completed ?? false,
    };

    return plainToInstance(TodoDto, normalizedEntity, {
      excludeExtraneousValues: false,
      enableImplicitConversion: true,
      exposeDefaultValues: true,
    });
  }

  transformMany(entities: TodoEntity[]): TodoDto[] {
    return entities.map((entity) => this.transform(entity));
  }
}
