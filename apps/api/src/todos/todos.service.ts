import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateTodoDto,
  ListTodosQueryDto,
  TodoDto,
  TodoListDto,
  UpdateTodoDto,
} from '@todos/core/http';
import { OrderDir, TodoDtoTransformer, TodoOrderBy } from '@todos/core/http';
import { TodoStoreService } from '@todos/store';

/**
 * Handles todo business operations for the API layer.
 */
@Injectable()
export class TodosService {
  private readonly transformer = new TodoDtoTransformer();

  constructor(private readonly todoStore: TodoStoreService) {}

  /**
   * Returns a paginated list of active (non-archived) todos owned by the
   * authenticated user, sorted by the requested field and direction.
   */
  async list(
    ownerId: string,
    query: ListTodosQueryDto = {},
  ): Promise<TodoListDto> {
    const {
      page = 1,
      limit = 20,
      orderBy = TodoOrderBy.CreatedAt,
      orderDir = OrderDir.Desc,
    } = query;

    const entities = await this.todoStore.findAll(ownerId, {
      includeArchived: false,
    });

    // Apply ordering
    const toMs = (val: Date | string | undefined): number =>
      val instanceof Date ? val.getTime() : val ? new Date(val).getTime() : 0;

    const sorted = [...entities].sort((a, b) => {
      const aVal = toMs(a[orderBy]);
      const bVal = toMs(b[orderBy]);
      return orderDir === OrderDir.Asc ? aVal - bVal : bVal - aVal;
    });

    const total = sorted.length;
    const offset = (page - 1) * limit;
    const pageItems = sorted.slice(offset, offset + limit);

    return {
      items: this.transformer.transformMany(pageItems),
      total,
      page,
      limit,
    };
  }

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

  /**
   * Archives a todo owned by the authenticated user (soft-delete).
   * Throws NotFoundException if the todo does not exist.
   */
  async archive(ownerId: string, id: string): Promise<TodoDto> {
    const entity = await this.todoStore.archive(ownerId, id);

    if (!entity) {
      throw new NotFoundException(`Todo with id "${id}" not found`);
    }

    return this.transformer.transform(entity);
  }
}
