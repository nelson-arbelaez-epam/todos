import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTodoDto, TodoDto } from '@todos/core/http';
import { type AuthenticatedRequest, FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { TodosService } from './todos.service';

@ApiTags('todos')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

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
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateTodoDto,
  ): Promise<TodoDto> {
    return this.todosService.create(request.user.uid, dto);
  }
}
