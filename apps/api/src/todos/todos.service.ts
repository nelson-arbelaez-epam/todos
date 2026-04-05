import {
  BadRequestException,
  Inject,
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
} from '@todos/dtos';
import { TODO_REPOSITORY, type TodoRepository } from './todo-repository';

@Injectable()
export class TodosService {
  private readonly createTodoValidator = new CreateTodoDtoValidator();

  private readonly updateTodoValidator = new UpdateTodoDtoValidator();

  constructor(
    @Inject(TODO_REPOSITORY)
    private readonly todoRepository: TodoRepository,
    private readonly todoDtoTransformer: TodoDtoTransformer,
  ) {}

  async findAll(includeArchived = false): Promise<TodoDto[]> {
    const todos = await this.todoRepository.findAll({ includeArchived });
    return this.todoDtoTransformer.transformMany(todos);
  }

  async findById(id: string): Promise<TodoDto> {
    const todo = await this.todoRepository.findById(id);

    if (!todo) {
      throw new NotFoundException(`Todo ${id} was not found`);
    }

    return this.todoDtoTransformer.transform(todo);
  }

  async create(payload: CreateTodoDto): Promise<TodoDto> {
    const validatedPayload = await this.validateCreatePayload(payload);
    const todo = await this.todoRepository.create({
      title: validatedPayload.title,
      description: validatedPayload.description,
      completed: validatedPayload.completed ?? false,
    });

    return this.todoDtoTransformer.transform(todo);
  }

  async update(id: string, payload: UpdateTodoDto): Promise<TodoDto> {
    const validatedPayload = await this.validateUpdatePayload(payload);
    const todo = await this.todoRepository.update(id, validatedPayload);

    if (!todo) {
      throw new NotFoundException(`Todo ${id} was not found`);
    }

    return this.todoDtoTransformer.transform(todo);
  }

  async archive(id: string): Promise<TodoDto> {
    const todo = await this.todoRepository.archive(id);

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
}
