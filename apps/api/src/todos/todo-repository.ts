import type { TodoEntity } from '@todos/dtos';

export const TODO_REPOSITORY = 'TODO_REPOSITORY';

export type CreateTodoRecord = Pick<
  TodoEntity,
  'title' | 'description' | 'completed'
>;

export type UpdateTodoRecord = Partial<CreateTodoRecord>;

export interface TodoRepository {
  create(input: CreateTodoRecord): Promise<TodoEntity>;
  update(id: string, input: UpdateTodoRecord): Promise<TodoEntity | null>;
  archive(id: string): Promise<TodoEntity | null>;
  findById(id: string): Promise<TodoEntity | null>;
  findAll(options?: { includeArchived?: boolean }): Promise<TodoEntity[]>;
}
