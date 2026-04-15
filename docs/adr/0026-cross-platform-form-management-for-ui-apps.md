# ADR 0026 - Cross-Platform Form Management and Shared Validation

- Status: Proposed
- Date: 2026-04-15
- Supersedes: Initial ADR 0026 (reverted via PR revert of #98)
- Related: Spike "Evaluate cross-platform form management library for web/mobile"; ADR 0021 (UI architecture); ADR 0024 (session state management); PR #80 (login flow); PR #55 (register flow)

## Context

Current form handling in `apps/web` and `apps/mobile` is implemented with local component
state and inline validation checks. This is acceptable for existing login/register flows,
but it does not scale well as forms become larger or require shared validation/UX behavior.

The backend (`apps/api`) uses `class-validator` + `class-transformer` decorators on DTOs
defined in `@todos/core/http`. NestJS's built-in `ValidationPipe` relies on these
decorator-based DTOs for request validation. The frontend has no shared path to these
validation rules today, which means rules are either duplicated or absent on the client.

There is a desire to reuse validation logic across the full stack:

- `apps/web` and `apps/mobile` need performant, type-safe client-side form validation for UX
  feedback.
- The same validation rules that govern backend request acceptance should be expressible from
  a single source of truth so they cannot drift apart.

We need one cross-platform direction that:

1. Keeps ADR 0021 boundaries intact (presentational components stay prop-driven and
   side-effect free; container/page boundaries own orchestration).
2. Uses a single validation source that the backend can enforce and the frontend can reuse
   for UX feedback without duplicating rules.

## Problem: The Dual-Validation Gap

The original ADR 0026 (reverted) proposed RHF + Zod purely for the frontend and kept
`class-validator` on the backend, treating them as separate concerns. This creates a
**dual-validation gap**:

- Validation rules expressed twice (once in Zod schemas for the UI, once in class-validator
  decorators in `@todos/core`) can silently diverge.
- Adding a new constraint (for example minimum length on `title`) requires updating both the
  Zod schema and the class-validator decorator independently.
- Frontend developers cannot trivially verify that their Zod schema matches the backend
  contract.

## Evaluation Criteria

Weights:

- Developer experience (DX): 20%
- Type safety: 20%
- Validation ergonomics: 20%
- Shared validation reuse (frontend ↔ backend): 20%
- Performance (re-render behavior on the UI): 10%
- Testability: 10%

Scores are from 1 (worst) to 5 (best).

## Options Considered

### Option A – RHF + Zod (frontend only) + class-validator (backend) — Side-by-Side

Keep the existing `class-validator` / `class-transformer` decorators in `@todos/core/http`.
Add companion Zod schemas alongside (either co-located in `@todos/core` or in each app).
Each app uses its own Zod schema for RHF; the backend keeps its existing validation pipeline.

Pros:

- Minimal backend changes; no migration risk to the existing NestJS pipeline.
- Swagger integration remains unchanged.

Cons:

- Two sources of truth. Rules must be updated in both places; no compile-time guarantee they
  match.
- `@todos/core` grows heavier with duplicate types (Zod + class-validator) for the same
  payloads.
- `@nestjs/swagger` and `class-transformer` remain mandatory dependencies in `@todos/core`,
  tying the core package to NestJS-specific decorators even for packages and apps that do not
  use NestJS.

Score: 2

### Option B – Zod-first with `nestjs-zod` (single source of truth)

Define all DTO validation rules as **Zod schemas** in `@todos/core/http`. Use the
[`nestjs-zod`](https://github.com/risen228/nestjs-zod) library to:

- Create NestJS-compatible DTO classes from Zod schemas via `createZodDto()`.
- Replace `ValidationPipe` with `ZodValidationPipe` (a global pipe that validates against the
  Zod schema embedded in the DTO class).
- Keep Swagger integration via `patchNestJsSwagger()` (nestjs-zod ships a Swagger patcher).

Frontend apps (`apps/web`, `apps/mobile`) import the same Zod schemas directly for RHF
resolver integration.

Pros:

- **Single source of truth**: all validation rules live in one Zod schema; backend and
  frontend are always in sync.
- Zod's schema types drive full TypeScript inference for request/response shapes.
- `@todos/core` sheds `class-validator`, `class-transformer`, and NestJS decorator
  dependencies (only `nestjs-zod` is needed in `apps/api`).
- `class-transformer` transformation steps (for example `.trim()`, type coercion for query
  params) are expressed with Zod's `.transform()` and `.preprocess()`.
- Swagger docs continue to be generated via `nestjs-zod`'s patcher.
- Frontend can reuse schemas without pulling in any NestJS-specific packages.

Cons:

- Migration effort: existing class-validator DTOs in `@todos/core/http` must be rewritten as
  Zod schemas, and the API `main.ts` pipe must be swapped.
- `nestjs-zod` is a third-party NestJS integration; it must be pinned and monitored for
  updates.
- Existing Swagger `@ApiProperty()` decorators are replaced by the schema-derived
  documentation (some manual Swagger metadata may require explicit Zod `.describe()` calls).

Score: 5

### Option C – Continue Custom Local State Hooks (status quo, no shared validation)

Keep class-validator on backend. Each app writes its own ad-hoc validation without RHF or
Zod.

Pros:

- No new dependencies.

Cons:

- No shared validation, no type-safe form management, high maintenance burden.

Score: 1

## Weighted Scorecard

| Option | DX (20%) | Type safety (20%) | Validation ergonomics (20%) | Shared reuse (20%) | Performance (10%) | Testability (10%) | Weighted total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A – RHF + Zod (FE) + class-validator (BE) | 4 | 4 | 4 | 1 | 5 | 4 | 3.40 |
| B – Zod-first + nestjs-zod | 5 | 5 | 5 | 5 | 5 | 5 | **5.00** |
| C – Status quo | 2 | 2 | 1 | 1 | 4 | 2 | 1.90 |

## Decision

Adopt **Option B – Zod-first with `nestjs-zod`** as the unified validation strategy across
the full stack.

- All DTO validation rules are expressed as **Zod schemas** and live in `@todos/core/http`.
- The NestJS API (`apps/api`) derives NestJS-compatible DTO classes from those schemas via
  `nestjs-zod`'s `createZodDto()` and validates with `ZodValidationPipe`.
- UI apps (`apps/web`, `apps/mobile`) import the same schemas from `@todos/core/http` and
  use them as RHF resolvers via `@hookform/resolvers/zod`.
- **Local `useState` forms remain acceptable for trivial flows** that do not require shared
  validation or reuse patterns.

## Integration Guidelines

### 1. Zod schema exports from `@todos/core/http`

Each payload (create, update, query, response) is backed by a named Zod schema:

```ts
// packages/core/src/http/todo.schema.ts
import { z } from 'zod';

export const createTodoSchema = z.object({
  title: z.string().min(1).trim(),
  description: z.string().optional(),
  completed: z.boolean().optional().default(false),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
```

### 2. NestJS DTO class (apps/api only)

```ts
// apps/api – uses nestjs-zod
import { createZodDto } from 'nestjs-zod';
import { createTodoSchema } from '@todos/core/http';

export class CreateTodoDto extends createZodDto(createTodoSchema) {}
```

The DTO class is used in controller `@Body()` parameters exactly as today. The global
`ZodValidationPipe` (registered in `main.ts`) handles validation automatically.

### 3. Frontend form hook (apps/web / apps/mobile)

```ts
// apps/web/src/hooks/forms/useCreateTodoForm.ts
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createTodoSchema, type CreateTodoInput } from '@todos/core/http';

export function useCreateTodoForm() {
  return useForm<CreateTodoInput>({
    resolver: zodResolver(createTodoSchema),
  });
}
```

### 4. Boundary placement

- `useForm` orchestration lives in page/container hooks (`src/hooks/forms/**`).
- Presentational components remain prop-driven (value, onChange, onBlur, error, disabled,
  onSubmit); they do not import RHF or Zod directly.
- Submit handlers map validated `CreateTodoInput` values to service/store boundaries.
  Backend validation is still authoritative; backend error responses must be mapped back to
  field-level or form-level errors in the container hook.

### 5. Testing strategy

- Unit test presentational form components in isolation via prop-driven states.
- Unit test container hooks for schema validation messages, submit success/failure paths, and
  backend error mapping.
- Avoid asserting internal RHF implementation details; test observable UI and DTO behavior.

## Migration Plan

1. **Add Zod to `@todos/core`**: add `zod` as a dependency; do not remove `class-validator`
   until migration is complete.
2. **Write Zod schemas** in `@todos/core/http` for each existing DTO (auth, todo, query
   params). Export both the schema and the inferred TypeScript type.
3. **Add `nestjs-zod` to `apps/api`**: register `ZodValidationPipe` globally and call
   `patchNestJsSwagger()` before generating the Swagger document.
4. **Migrate DTO classes** in `apps/api` from class-validator decorators to
   `createZodDto()` wrappers, one DTO at a time.
5. **Remove `class-validator` and `class-transformer`** from `@todos/core` and `apps/api`
   once all DTOs are migrated and tests pass.
6. **Add RHF + resolvers + Zod** to `apps/web` and `apps/mobile` and implement form hooks
   in `src/hooks/forms/`.
7. **Pilot on auth forms** (login, register) to validate cross-platform conventions.
8. **Adopt for new complex forms first**; refactor existing forms opportunistically.

## Follow-Up PBIs

1. Add `zod` to `@todos/core` and write Zod schemas for all existing HTTP DTOs.
2. Add `nestjs-zod` to `apps/api`; wire `ZodValidationPipe` and Swagger patcher.
3. Migrate `@todos/core/http` DTOs from class-validator to `createZodDto()` wrappers.
4. Add `react-hook-form`, `@hookform/resolvers`, and `zod` to `apps/web` and `apps/mobile`.
5. Implement `src/hooks/forms/` container hooks for auth and todo forms.
6. Add shared backend-error-to-field-error mapping helpers.
7. Update UI development documentation with "when to use RHF vs local state" checklist.
