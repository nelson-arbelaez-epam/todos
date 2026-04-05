# @todos/shared

Shared utilities, modules, and common code for Todos applications.

## Overview

This package provides:

- **Global Exception Filter**: Standardized error handling for NestJS applications
- **Health Check Module**: Application health monitoring with @nestjs/terminus
- **Common utilities**: Shared functions and helpers

## Usage

### Global Exception Filter

```typescript
import { GlobalExceptionFilter } from '@todos/shared';

app.useGlobalFilters(new GlobalExceptionFilter());
```

### Health Check

```typescript
import { HealthModule } from '@todos/shared';

@Module({
  imports: [HealthModule],
})
export class AppModule {}
```

This provides a `/health` endpoint for monitoring application status.
