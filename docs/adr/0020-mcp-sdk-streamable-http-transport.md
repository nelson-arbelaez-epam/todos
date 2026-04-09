# ADR 0020 - MCP SDK Streamable HTTP Transport for the MCP Application

- Status: Accepted
- Date: 2026-04-09
- Related: ADR 0018, ADR 0019

## Context

The `apps/mcp` application is a NestJS-based server whose primary purpose is to expose
Todos functionality as **MCP (Model Context Protocol) tools** that can be used by
AI agents, IDE extensions (e.g., Cursor, GitHub Copilot), and other MCP-compatible
clients.

An earlier iteration exposed a plain REST endpoint (`POST /api/v1/todos`) which callers
had to call directly. This is not how MCP clients communicate: the Model Context Protocol
uses JSON-RPC 2.0 over either stdio or HTTP transports, and clients expect a well-formed
MCP server to negotiate capabilities, accept tool calls, and return structured results
through the protocol.

Without a proper MCP server implementation the application:

- Cannot be listed in `.mcp.json` / MCP client configurations
- Misses the standard tool discovery flow (clients cannot call `tools/list`)
- Provides no standard error codes or protocol-level capability negotiation
- Requires MCP clients to know the exact REST shape rather than using the tool schema

## Decision

The `apps/mcp` application adopts the official **`@modelcontextprotocol/sdk`** library
with its **Streamable HTTP transport** in stateless mode.

Key points:

- **Stateless per-request mode**: a new `McpServer` and `StreamableHTTPServerTransport`
  are created for each incoming POST request and destroyed when the response stream
  closes. This avoids shared mutable state between concurrent requests while keeping
  the implementation simple.
- **Injectable `McpServerService`**: the `McpServer` factory logic is wrapped in a
  NestJS `@Injectable()` service, enabling standard dependency injection. The service
  receives `TodosApiService` via constructor injection and binds it inside each tool
  handler. No global or module-level singletons are shared.
- **`McpController`** exposes three routes on the `/mcp` path (excluded from the
  `api/v1` global prefix):
  - `POST /mcp` — JSON-RPC 2.0 MCP request handler
  - `GET /mcp` — 405 (SSE streaming not supported in stateless mode)
  - `DELETE /mcp` — 405 (session deletion not applicable)
- **`create_todo` tool**: todos creation is registered as an MCP tool with a
  [Zod](https://zod.dev/) input schema. The `apiToken` (Firebase ID token) is passed
  as a tool input parameter so that any MCP client can supply credentials without
  needing a separate HTTP header mechanism.
- **Zod** (`zod@^4`) is the schema library used for input validation within tool
  definitions, consistent with the SDK's recommended approach.
- The overlay-bot / autonomous agent pattern is explicitly **out of scope**; the
  server only wraps the existing Todos API and is consumed passively by client-driven
  tool calls.

## Endpoint

```
POST http://localhost:3000/mcp
```

Example `.mcp.json`:

```json
{
  "mcpServers": {
    "todos": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

## Options Evaluated

| Option | Description |
| ------ | ----------- |
| **Plain REST endpoint** | Original approach. Not MCP-compatible; clients must know the exact REST shape. |
| **`@modelcontextprotocol/sdk` stateless HTTP** ✅ | Official SDK, standard protocol, DI-friendly, simple per-request lifecycle. |
| **`@modelcontextprotocol/sdk` stateful HTTP (sessions)** | Required for streaming notifications or long-running tasks. Higher complexity; not needed for MVP. |
| **stdio transport** | Suitable for single-process CLI use. Not appropriate for a network-accessible NestJS server. |

## Weighted Scorecard

Weights:

- MCP client compatibility / standard compliance: 35%
- Implementation simplicity: 25%
- NestJS DI / testability: 25%
- Future extensibility (add more tools, sessions): 15%

Scores are 1 (worst) to 5 (best).

| Option | MCP compatibility (35%) | Simplicity (25%) | DI / testability (25%) | Extensibility (15%) | Weighted Total |
| --- | --- | --- | --- | --- | --- |
| Plain REST | 1 | 5 | 4 | 2 | 2.80 |
| **SDK stateless HTTP** | 5 | 4 | 5 | 3 | **4.40** |
| SDK stateful HTTP | 5 | 2 | 4 | 5 | 4.00 |
| stdio | 5 | 3 | 2 | 1 | 3.35 |

## Consequences

- `@modelcontextprotocol/sdk` and `zod` are added as runtime dependencies of `@todos/mcp`.
- The old `TodosController` (plain REST) and its tests are removed; the functionality is
  replaced by the `create_todo` MCP tool.
- `/mcp` is excluded from the `api/v1` global prefix so that clients connect at
  `http://host:port/mcp` without a path prefix.
- Future tools (e.g., `list_todos`, `update_todo`) can be added to `McpServerService`
  without touching the transport or controller layer.
- If long-lived connections or server-sent notifications are needed in the future, the
  transport can be switched to stateful mode under a new ADR.

## Tech Debt

- Currently `apiToken` is a tool input parameter. A cleaner approach would be to use
  the transport's `AuthInfo` mechanism (standard Bearer auth in the HTTP Authorization
  header) once the MCP auth specification stabilises. This can be introduced under a
  follow-up ADR without breaking existing callers.
