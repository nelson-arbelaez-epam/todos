import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  MCPCreateTodoDtoValidator,
  MCPCreateTodoRequest,
  MCPTodoResponse,
} from '@todos/core/mcp';
import { ValidationError } from '@todos/core/validators';
import { TodosApiService } from './todos.service';

@ApiTags('todos')
@ApiHeader({
  name: 'x-api-token',
  description: 'Firebase ID token used for Bearer authentication',
  required: true,
})
@ApiBearerAuth('x-api-token')
@Controller('todos')
export class TodosController {
  private readonly logger = new Logger(TodosController.name);
  private readonly validator = new MCPCreateTodoDtoValidator();

  constructor(private readonly todosApiService: TodosApiService) {}

  /**
   * Creates a new todo by forwarding the request to the Todos API with Bearer auth.
   * Requires a valid Firebase ID token provided via the `x-api-token` header.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new todo via MCP (requires api-token)' })
  @ApiBody({ type: MCPCreateTodoRequest })
  @ApiResponse({
    status: 201,
    description: 'Todo created successfully',
    type: MCPTodoResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
    type: MCPTodoResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid api-token',
    type: MCPTodoResponse,
  })
  async create(
    @Headers('x-api-token') apiToken: string | undefined,
    @Body() body: MCPCreateTodoRequest,
  ): Promise<MCPTodoResponse> {
    if (!apiToken || apiToken.trim() === '') {
      throw new UnauthorizedException(
        'Missing api-token: provide a valid Firebase ID token via the x-api-token header',
      );
    }

    let dto: MCPCreateTodoRequest;
    try {
      dto = await this.validator.validate(body);
    } catch (err: unknown) {
      if (err instanceof ValidationError) {
        throw new BadRequestException({
          message: err.message,
          errors: err.errors,
        });
      }
      throw new BadRequestException('Invalid request body');
    }

    try {
      const data = await this.todosApiService.createTodo(apiToken, dto);
      return { success: true, data };
    } catch (err: unknown) {
      const status =
        (err as { status?: number }).status ?? HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        err instanceof Error ? err.message : 'Unexpected error from API';

      if (status === HttpStatus.UNAUTHORIZED) {
        throw new UnauthorizedException(
          'Invalid or expired api-token: the provided token was rejected by the API',
        );
      }

      this.logger.error(`API call failed with status ${status}: ${message}`);
      return { success: false, error: message };
    }
  }
}
