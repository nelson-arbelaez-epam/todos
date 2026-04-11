import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { TodosApiService } from '../todos/todos.service';

/**
 * Injectable NestJS service that creates and configures MCP server instances.
 *
 * Exposes a {@link createServer} factory method that builds a fresh {@link McpServer}
 * pre-loaded with the `create_todo` tool. The service is intentionally stateless so
 * that one server instance can be created per HTTP request (stateless streamable-HTTP
 * transport mode) while still benefiting from NestJS dependency injection.
 *
 * See ADR 0020 for the decision rationale.
 */
@Injectable()
export class McpServerService {
  private readonly logger = new Logger(McpServerService.name);

  constructor(private readonly todosApiService: TodosApiService) {}

  /**
   * Creates a new {@link McpServer} configured with all registered MCP tools.
   * Call this once per incoming request; do not share instances across requests.
   */
  createServer(apiToken: string): McpServer {
    const server = new McpServer({
      name: 'todos-mcp-server',
      version: '1.0.0',
    });

    server.registerTool(
      'create_todo',
      {
        description: 'Create a new todo item in the Todos API.',
        inputSchema: {
          title: z.string().min(1).describe('Title of the todo'),
          description: z
            .string()
            .optional()
            .describe('Optional description for the todo'),
          completed: z
            .boolean()
            .optional()
            .describe('Initial completion status (default: false)'),
        },
      },
      async ({ title, description, completed }) => {
        try {
          const todo = await this.todosApiService.createTodo(apiToken, {
            title,
            description,
            completed,
          });
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(todo) }],
          };
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Unknown error creating todo';
          this.logger.error(`create_todo tool failed: ${message}`);
          return {
            content: [{ type: 'text' as const, text: `Error: ${message}` }],
            isError: true,
          };
        }
      },
    );

    server.registerTool(
      'list_todos',
      {
        description:
          'List active (non-archived) todo items from the Todos API.',
        inputSchema: {
          page: z
            .number()
            .int()
            .positive()
            .optional()
            .describe('Page number for pagination (default: 1)'),
          limit: z
            .number()
            .int()
            .positive()
            .optional()
            .describe('Maximum number of todos to return (default: 20)'),
          orderBy: z
            .enum(['createdAt', 'updatedAt'])
            .optional()
            .describe('Field to sort by (default: createdAt)'),
          orderDir: z
            .enum(['asc', 'desc'])
            .optional()
            .describe('Sort direction (default: desc)'),
        },
      },
      async ({ page, limit, orderBy, orderDir }) => {
        try {
          const result = await this.todosApiService.listTodos(apiToken, {
            page,
            limit,
            orderBy,
            orderDir,
          });
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(result) }],
          };
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Unknown error listing todos';
          this.logger.error(`list_todos tool failed: ${message}`);
          return {
            content: [{ type: 'text' as const, text: `Error: ${message}` }],
            isError: true,
          };
        }
      },
    );

    return server;
  }
}
