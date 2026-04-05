import type { TodoEntity } from '../http/todo.entity';

export interface CreateTodoInput {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface FindTodosOptions {
  includeArchived?: boolean;
}

export interface TodoRepository {
  create(ownerId: string, input: CreateTodoInput): Promise<TodoEntity>;
  findById(ownerId: string, id: string): Promise<TodoEntity | null>;
  findAll(ownerId: string, options?: FindTodosOptions): Promise<TodoEntity[]>;
  update(
    ownerId: string,
    id: string,
    input: UpdateTodoInput,
  ): Promise<TodoEntity | null>;
  archive(ownerId: string, id: string): Promise<TodoEntity | null>;
  delete(ownerId: string, id: string): Promise<boolean>;
}

export const TODO_REPOSITORY = Symbol('TODO_REPOSITORY');
