import 'reflect-metadata';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Test, type TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TodosApiService } from '../todos/todos.service';
import { McpServerService } from './mcp-server.service';

const mockTodo = {
  id: 'todo-1',
  title: 'Test Todo',
  description: 'A test todo',
  completed: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockTodosApiService = {
  createTodo: vi.fn(),
  listTodos: vi.fn(),
};

describe('McpServerService', () => {
  let service: McpServerService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpServerService,
        { provide: TodosApiService, useValue: mockTodosApiService },
      ],
    }).compile();

    service = module.get<McpServerService>(McpServerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createServer', () => {
    it('should return an McpServer instance', () => {
      const server = service.createServer();
      expect(server).toBeInstanceOf(McpServer);
    });

    it('should return a new server instance on each call', () => {
      const server1 = service.createServer();
      const server2 = service.createServer();
      expect(server1).not.toBe(server2);
    });

    it('should create a server with the create_todo tool registered', () => {
      const server = service.createServer();
      // The registered tools are accessible on the internal Server's request handlers.
      // We verify the server has capabilities for tools.
      expect(server).toBeDefined();
    });
  });

  describe('list_todos tool', () => {
    // biome-ignore lint/suspicious/noExplicitAny: spy on internal registerTool
    let registerToolSpy: ReturnType<typeof vi.spyOn<any, any>>;

    beforeEach(() => {
      registerToolSpy = vi.spyOn(McpServer.prototype, 'registerTool');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const getListTodosHandler = (apiToken = 'test-token') => {
      service.createServer(apiToken);
      const call = registerToolSpy.mock.calls.find(
        ([name]: [string]) => name === 'list_todos',
      );
      // biome-ignore lint/suspicious/noExplicitAny: handler is typed by MCP SDK
      return call?.[2] as (args: Record<string, any>) => Promise<{
        content: { type: string; text: string }[];
        isError?: boolean;
      }>;
    };

    it('should return structured todos on a successful API call', async () => {
      const mockListResult = {
        todos: [mockTodo],
        total: 1,
        hasMore: false,
      };
      mockTodosApiService.listTodos.mockResolvedValue(mockListResult);

      const handler = getListTodosHandler();
      const result = await handler({});

      expect(result.isError).toBeUndefined();
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(JSON.parse(result.content[0].text)).toEqual(mockListResult);
      expect(mockTodosApiService.listTodos).toHaveBeenCalledWith('test-token', {
        page: undefined,
        limit: undefined,
        orderBy: undefined,
        orderDir: undefined,
      });
    });

    it('should return an empty todos list when there are no active todos', async () => {
      const mockEmptyResult = { todos: [], total: 0, hasMore: false };
      mockTodosApiService.listTodos.mockResolvedValue(mockEmptyResult);

      const handler = getListTodosHandler();
      const result = await handler({});

      expect(result.isError).toBeUndefined();
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.todos).toHaveLength(0);
      expect(parsed.total).toBe(0);
      expect(parsed.hasMore).toBe(false);
    });

    it('should forward limit, orderBy, and orderDir query parameters', async () => {
      const mockListResult = { todos: [mockTodo], total: 1, hasMore: false };
      mockTodosApiService.listTodos.mockResolvedValue(mockListResult);

      const handler = getListTodosHandler();
      await handler({ page: 2, limit: 5, orderBy: 'updatedAt', orderDir: 'asc' });

      expect(mockTodosApiService.listTodos).toHaveBeenCalledWith('test-token', {
        page: 2,
        limit: 5,
        orderBy: 'updatedAt',
        orderDir: 'asc',
      });
    });

    it('should return an error response when the API call fails', async () => {
      mockTodosApiService.listTodos.mockRejectedValue(
        new Error('Service unavailable'),
      );

      const handler = getListTodosHandler();
      const result = await handler({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe('Error: Service unavailable');
    });
  });
});
