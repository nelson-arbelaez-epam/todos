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
      'update_todo',
      {
        description: 'Update fields of an existing todo item in the Todos API.',
        inputSchema: {
          id: z.string().min(1).describe('ID of the todo to update'),
          title: z
            .string()
            .min(1)
            .optional()
            .describe('New title for the todo'),
          description: z
            .string()
            .optional()
            .describe('New description for the todo'),
          completed: z
            .boolean()
            .optional()
            .describe('New completion status for the todo'),
        },
      },
      async ({ id, title, description, completed }) => {
        try {
          const todo = await this.todosApiService.updateTodo(apiToken, id, {
            title,
            description,
            completed,
          });
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(todo) }],
          };
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Unknown error updating todo';
          this.logger.error(`update_todo tool failed: ${message}`);
          return {
            content: [{ type: 'text' as const, text: `Error: ${message}` }],
            isError: true,
          };
        }
      },
    );

    server.registerTool(
      'complete_todo',
      {
        description: 'Mark a todo item as completed or incomplete.',
        inputSchema: {
          id: z.string().min(1).describe('ID of the todo to complete'),
          completed: z
            .boolean()
            .default(true)
            .describe('Completion status to set (default: true)'),
        },
      },
      async ({ id, completed }) => {
        try {
          const todo = await this.todosApiService.updateTodo(apiToken, id, {
            completed,
          });
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(todo) }],
          };
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : 'Unknown error completing todo';
          this.logger.error(`complete_todo tool failed: ${message}`);
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

    server.registerTool(
      'archive_todo',
      {
        description:
          'Archive (soft-delete) a todo item. The todo is not physically deleted but will be excluded from active lists.',
        inputSchema: {
          id: z.string().min(1).describe('ID of the todo to archive'),
        },
      },
      async ({ id }) => {
        try {
          const todo = await this.todosApiService.archiveTodo(apiToken, id);
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(todo) }],
          };
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'Unknown error archiving todo';
          this.logger.error(`archive_todo tool failed: ${message}`);
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
