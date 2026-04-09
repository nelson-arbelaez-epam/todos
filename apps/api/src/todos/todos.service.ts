import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateTodoDto, TodoDto, UpdateTodoDto } from '@todos/core/http';
import { TodoDtoTransformer } from '@todos/core/http';
import { TodoStoreService } from '@todos/store';

/**
 * Handles todo business operations for the API layer.
 */
@Injectable()
export class TodosService {
  private readonly transformer = new TodoDtoTransformer();

  constructor(private readonly todoStore: TodoStoreService) {}

  /**
   * Creates a new todo owned by the authenticated user.
   */
  async create(ownerId: string, dto: CreateTodoDto): Promise<TodoDto> {
    const entity = await this.todoStore.create(ownerId, {
      title: dto.title,
      description: dto.description,
      completed: dto.completed,
    });

    return this.transformer.transform(entity);
  }

  /**
   * Updates an existing todo owned by the authenticated user.
   * Throws NotFoundException if the todo does not exist.
   */
  async update(
    ownerId: string,
    id: string,
    dto: UpdateTodoDto,
  ): Promise<TodoDto> {
    const entity = await this.todoStore.update(ownerId, id, {
      title: dto.title,
      description: dto.description,
      completed: dto.completed,
    });

    if (!entity) {
      throw new NotFoundException(`Todo with id "${id}" not found`);
    }

    return this.transformer.transform(entity);
  }
}
