import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  type CreateTodoDto,
  CreateTodoDtoValidator,
  type TodoDto,
  TodoDtoTransformer,
  type UpdateTodoDto,
  UpdateTodoDtoValidator,
  ValidationError,
} from '@todos/core';
import { TodoStoreService } from '@todos/store';

@Injectable()
export class TodosService {
  private readonly createTodoValidator = new CreateTodoDtoValidator();

  private readonly updateTodoValidator = new UpdateTodoDtoValidator();

  constructor(
    private readonly todoStoreService: TodoStoreService,
    private readonly todoDtoTransformer: TodoDtoTransformer,
  ) {}

  async findAll(includeArchived = false): Promise<TodoDto[]> {
    const todos = await this.todoStoreService.findAll(
      this.getDefaultOwnerId(),
      {
        includeArchived,
      },
    );
    return this.todoDtoTransformer.transformMany(todos);
  }

  async findById(id: string): Promise<TodoDto> {
    const todo = await this.todoStoreService.findById(
      this.getDefaultOwnerId(),
      id,
    );

    if (!todo) {
      throw new NotFoundException(`Todo ${id} was not found`);
    }

    return this.todoDtoTransformer.transform(todo);
  }

  async create(payload: CreateTodoDto): Promise<TodoDto> {
    const validatedPayload = await this.validateCreatePayload(payload);
    const todo = await this.todoStoreService.create(this.getDefaultOwnerId(), {
      title: validatedPayload.title,
      description: validatedPayload.description,
      completed: validatedPayload.completed ?? false,
    });

    return this.todoDtoTransformer.transform(todo);
  }

  async update(id: string, payload: UpdateTodoDto): Promise<TodoDto> {
    const validatedPayload = await this.validateUpdatePayload(payload);
    const todo = await this.todoStoreService.update(
      this.getDefaultOwnerId(),
      id,
      validatedPayload,
    );

    if (!todo) {
      throw new NotFoundException(`Todo ${id} was not found`);
    }

    return this.todoDtoTransformer.transform(todo);
  }

  async archive(id: string): Promise<TodoDto> {
    const todo = await this.todoStoreService.archive(
      this.getDefaultOwnerId(),
      id,
    );

    if (!todo) {
      throw new NotFoundException(`Todo ${id} was not found`);
    }

    return this.todoDtoTransformer.transform(todo);
  }

  private async validateCreatePayload(
    payload: CreateTodoDto,
  ): Promise<CreateTodoDto> {
    try {
      return await this.createTodoValidator.validate(payload);
    } catch (error) {
      this.throwValidationError(error);
    }
  }

  private async validateUpdatePayload(
    payload: UpdateTodoDto,
  ): Promise<UpdateTodoDto> {
    try {
      return await this.updateTodoValidator.validate(payload);
    } catch (error) {
      this.throwValidationError(error);
    }
  }

  private throwValidationError(error: unknown): never {
    if (error instanceof ValidationError) {
      const validationError = error as ValidationError;

      throw new BadRequestException({
        error: 'Bad Request',
        message: validationError.message,
        details: validationError.errors,
      });
    }

    throw error;
  }

  private getDefaultOwnerId(): string {
    return process.env.TODO_DEFAULT_OWNER_ID ?? 'default-owner';
  }
}
