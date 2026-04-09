import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTodoDto, TodoDto, UpdateTodoDto } from '@todos/core/http';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { CurrentUser } from '../auth/current-user.decorator';
import { TodosService } from './todos.service';

@ApiTags('todos')
@ApiBearerAuth('firebase-jwt')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  /**
   * Lists all active (non-archived) todos for the authenticated user.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List active todos' })
  @ApiResponse({
    status: 200,
    description: 'Active todos retrieved successfully',
    type: [TodoDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(@CurrentUser() user: DecodedIdToken): Promise<TodoDto[]> {
    return this.todosService.list(user.uid);
  }

  /**
   * Creates a new todo for the authenticated user.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateTodoDto })
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiResponse({
    status: 201,
    description: 'Todo created successfully',
    type: TodoDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @CurrentUser() user: DecodedIdToken,
    @Body() dto: CreateTodoDto,
  ): Promise<TodoDto> {
    return this.todosService.create(user.uid, dto);
  }

  /**
   * Updates an existing todo for the authenticated user.
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'Todo identifier' })
  @ApiBody({ type: UpdateTodoDto })
  @ApiOperation({ summary: 'Update an existing todo' })
  @ApiResponse({
    status: 200,
    description: 'Todo updated successfully',
    type: TodoDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Todo not found' })
  async update(
    @CurrentUser() user: DecodedIdToken,
    @Param('id') id: string,
    @Body() dto: UpdateTodoDto,
  ): Promise<TodoDto> {
    return this.todosService.update(user.uid, id, dto);
  }
}
