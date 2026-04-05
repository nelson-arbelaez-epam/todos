# @todos/dtos

Shared Data Transfer Objects (DTOs), transformers, and validators for the todos application.

## Overview

This package provides:

- **DTOs**: Type-safe data structures for HTTP and MCP (Model Context Protocol) APIs
- **Transformers**: Convert between entity and DTO representations
- **Validators**: Validate and normalize incoming data

## Structure

```
src/
├── transformers/       # Transform logic (entity -> DTO)
├── validators/         # Validation logic
├── http/              # HTTP-specific DTOs and utilities
├── mcp/               # MCP-specific DTOs and utilities
└── index.ts           # Public API
```

## Usage

### HTTP DTOs

```typescript
import {
  CreateTodoDto,
  UpdateTodoDto,
  TodoDto,
  CreateTodoDtoValidator,
  TodoDtoTransformer,
} from "@todos/dtos/http";

// Validate incoming data
const validator = new CreateTodoDtoValidator();
const createDto = validator.validate(req.body);

// Transform entity to response DTO
const transformer = new TodoDtoTransformer();
const responseDto = transformer.transform(todoEntity);
```

### MCP DTOs

```typescript
import {
  MCPCreateTodoRequest,
  MCPTodoDto,
  MCPCreateTodoDtoValidator,
  MCPTodoDtoTransformer,
} from "@todos/dtos/mcp";

// Validate MCP requests
const validator = new MCPCreateTodoDtoValidator();
const request = validator.validate(mcpData);

// Transform to MCP response format
const transformer = new MCPTodoDtoTransformer();
const mcp_dto = transformer.transform(entity);
```

## API Reference

### Transformers

All transformers extend `BaseTransformer<Input, Output>` and implement:

- `transform(input: Input): Output` - Transform a single item
- `transformMany(inputs: Input[]): Output[]` - Transform multiple items

### Validators

All validators extend `BaseValidator<T>` and implement:

- `validate(data: unknown): T` - Validate and return typed data
- `isValid(data: unknown): boolean` - Check if data is valid

Validators throw `ValidationError` on failure with detailed error messages.

## HTTP DTO Types

### CreateTodoDto
```typescript
{
  title: string;
  description?: string;
  completed?: boolean;
}
```

### UpdateTodoDto
```typescript
{
  title?: string;
  description?: string;
  completed?: boolean;
}
```

### TodoDto
```typescript
{
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## MCP DTO Types

### MCPCreateTodoRequest
```typescript
{
  title: string;
  description?: string;
  completed?: boolean;
}
```

### MCPUpdateTodoRequest
```typescript
{
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
}
```

### MCPTodoDto
```typescript
{
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### MCPTodoListResponse
```typescript
{
  todos: MCPTodoDto[];
  total: number;
  hasMore: boolean;
}
```

## Testing

Run tests:
```bash
yarn test
```

Run tests in watch mode:
```bash
yarn test:watch
```

## Building

```bash
yarn build
```

Output is generated in the `dist/` directory.
