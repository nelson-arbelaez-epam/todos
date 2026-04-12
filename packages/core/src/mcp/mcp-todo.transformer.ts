import { plainToInstance } from 'class-transformer';
import type { TodoEntity } from '../http/todo.entity';
import { MCPTodoDto } from './mcp-todo.dto';

/**
 * Entity-to-MCP-DTO transformer using class-transformer
 */
export class MCPTodoDtoTransformer {
  transform(entity: TodoEntity): MCPTodoDto {
    // Convert dates to ISO strings for MCP serialization
    const transformedEntity = {
      ...entity,
      archivedAt: entity.archivedAt
        ? new Date(entity.archivedAt).toISOString()
        : undefined,
      createdAt: entity.createdAt
        ? new Date(entity.createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: entity.updatedAt
        ? new Date(entity.updatedAt).toISOString()
        : new Date().toISOString(),
      completed: entity.completed ?? false,
    };

    return plainToInstance(MCPTodoDto, transformedEntity, {
      excludeExtraneousValues: false,
      enableImplicitConversion: true,
    });
  }

  transformMany(entities: TodoEntity[]): MCPTodoDto[] {
    return entities.map((entity) => this.transform(entity));
  }
}
