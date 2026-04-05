import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  type CreateTodoInput,
  type FindTodosOptions,
  TODO_REPOSITORY,
  type TodoEntity,
  type TodoRepository,
  type UpdateTodoInput,
} from '@todos/core';

@Injectable()
export class TodoStoreService {
  constructor(
    @Optional()
    @Inject(TODO_REPOSITORY)
    private readonly todoRepository?: TodoRepository,
  ) {}

  /**
   * Creates a todo owned by the authenticated user.
   */
  create(ownerId: string, input: CreateTodoInput): Promise<TodoEntity> {
    return this.getRepository().create(ownerId, input);
  }

  /**
   * Returns one todo by owner and id.
   */
  findById(ownerId: string, id: string): Promise<TodoEntity | null> {
    return this.getRepository().findById(ownerId, id);
  }

  /**
   * Returns all todos for an owner.
   */
  findAll(ownerId: string, options?: FindTodosOptions): Promise<TodoEntity[]> {
    return this.getRepository().findAll(ownerId, options);
  }

  /**
   * Updates one todo by owner and id.
   */
  update(
    ownerId: string,
    id: string,
    input: UpdateTodoInput,
  ): Promise<TodoEntity | null> {
    return this.getRepository().update(ownerId, id, input);
  }

  /**
   * Archives one todo by owner and id.
   */
  archive(ownerId: string, id: string): Promise<TodoEntity | null> {
    return this.getRepository().archive(ownerId, id);
  }

  /**
   * Deletes one todo by owner and id.
   */
  delete(ownerId: string, id: string): Promise<boolean> {
    return this.getRepository().delete(ownerId, id);
  }

  private getRepository(): TodoRepository {
    if (!this.todoRepository) {
      throw new Error(
        'TodoRepository is not configured. Provide TODO_REPOSITORY before importing TodoStoreModule.',
      );
    }

    return this.todoRepository;
  }
}
