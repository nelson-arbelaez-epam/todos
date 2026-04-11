import { Injectable, Logger } from '@nestjs/common';
import type {
  MCPCreateTodoRequest,
  MCPTodoDto,
  MCPTodoListResponse,
} from '@todos/core/mcp';

/**
 * Service that proxies todo operations to the Todos API using a Bearer token.
 */
@Injectable()
export class TodosApiService {
  private readonly logger = new Logger(TodosApiService.name);
  private readonly apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.TODOS_API_URL ?? 'http://localhost:3000';
  }

  /**
   * Creates a new todo via the Todos API, authenticated with the provided token.
   *
   * @param apiToken - Bearer token forwarded from the client (not logged in plain text)
   * @param dto - Todo creation payload
   */
  async createTodo(
    apiToken: string,
    dto: MCPCreateTodoRequest,
  ): Promise<MCPTodoDto> {
    const url = `${this.apiBaseUrl}/api/v1/todos`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      const message = body?.message ?? response.statusText;
      this.logger.warn(`API responded ${response.status}: ${message}`);
      const error = Object.assign(new Error(message), {
        status: response.status,
      });
      throw error;
    }

    return response.json() as Promise<MCPTodoDto>;
  }

  /**
   * Lists active (non-archived) todos via the Todos API, authenticated with the provided token.
   *
   * @param apiToken - Bearer token forwarded from the client (not logged in plain text)
   * @param params - Optional query parameters (limit, orderBy, orderDir)
   */
  async listTodos(
    apiToken: string,
    params?: { limit?: number; orderBy?: string; orderDir?: string },
  ): Promise<MCPTodoListResponse> {
    const url = new URL(`${this.apiBaseUrl}/api/v1/todos`);
    if (params?.limit != null) {
      url.searchParams.set('limit', String(params.limit));
    }
    if (params?.orderBy != null) {
      url.searchParams.set('orderBy', params.orderBy);
    }
    if (params?.orderDir != null) {
      url.searchParams.set('orderDir', params.orderDir);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      const message = body?.message ?? response.statusText;
      this.logger.warn(`API responded ${response.status}: ${message}`);
      const error = Object.assign(new Error(message), {
        status: response.status,
      });
      throw error;
    }

    const data = (await response.json()) as {
      items: MCPTodoDto[];
      total: number;
      page: number;
      limit: number;
    };

    return {
      todos: data.items,
      total: data.total,
      hasMore: data.page * data.limit < data.total,
    };
  }
}
