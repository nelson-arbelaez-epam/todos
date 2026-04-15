# ADR 0026 - Cross-Platform Form Management for UI Apps

- Status: Accepted
- Date: 2026-04-14
- Related: Spike "Evaluate cross-platform form management library for web/mobile"; ADR 0021 (UI architecture); ADR 0024 (session state management); PR #80 (login flow); PR #55 (register flow)

## Context

Current form handling in `apps/web` and `apps/mobile` is implemented with local component
state and inline validation checks. This is acceptable for existing login/register flows,
but it does not scale well as forms become larger or require shared validation/UX behavior.

We need one cross-platform direction that keeps ADR 0021 boundaries intact:

- presentational components remain side-effect free and reusable;
- container/page boundaries own orchestration;
- store/session boundaries from ADR 0024 remain the source of auth/session truth.

Backend validation remains authoritative. Client-side validation is for UX feedback and
input quality only.

## Evaluation Criteria

Weights:

- Developer experience (DX): 20%
- Type safety: 20%
- Validation ergonomics: 20%
- Performance (re-render behavior): 15%
- Testability: 15%
- React Native support/parity with web: 10%

Scores are from 1 (worst) to 5 (best).

The single score shown under each option is a quick qualitative summary. The weighted
scorecard is the authoritative decision input because it maps each criterion to its weight.

## Options Considered

### Option A - React Hook Form + `@hookform/resolvers` + Zod

Pros:

- Strong performance profile through uncontrolled-input-first design and granular
  subscriptions.
- Excellent TypeScript inference with Zod schemas and resolver-based error mapping.
- Mature React Native support via `Controller`, with comparable patterns across web/mobile.
- Works well with thin container hooks (`src/hooks`) and presentational component props.
- Testable at hook/container level without coupling tests to implementation details.

Cons:

- Slight learning curve around `Controller` and form lifecycle concepts.
- Requires explicit conventions to avoid leaking library details into presentational
  components.

Score: 5

### Option B - Formik (+ Yup-style schema validation)

Pros:

- Familiar API and broad ecosystem adoption.
- Clear mental model for controlled forms.

Cons:

- More re-render pressure on larger forms due to controlled-state approach.
- Type inference ergonomics are weaker than RHF + Zod in strict TypeScript usage.
- React Native support is workable but less ergonomic for performant field-level updates.

Score: 3

### Option C - Continue Custom Local State Hooks/Components

Pros:

- No new dependency cost.
- Maximum implementation flexibility for very small forms.

Cons:

- Repeated validation logic and error-state patterns across apps.
- Inconsistent UX and higher long-term maintenance burden.
- Harder to standardize test patterns and reusable form behavior.

Score: 2

## Weighted Scorecard

| Option | DX (20%) | Type safety (20%) | Validation ergonomics (20%) | Performance (15%) | Testability (15%) | RN parity (10%) | Weighted total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RHF + resolvers + Zod | 5 | 5 | 5 | 5 | 4 | 5 | 4.85 |
| Formik | 3 | 3 | 3 | 3 | 4 | 3 | 3.15 |
| Custom local state | 3 | 2 | 2 | 4 | 3 | 4 | 2.85 |

## Decision

Adopt **React Hook Form + `@hookform/resolvers` + Zod** as the default form management
approach for non-trivial forms in both `apps/web` and `apps/mobile`.

Local `useState` forms remain acceptable for trivial flows (for example one-field filters
or short-lived forms without reusable validation needs).

## Integration Guidelines (Web + Mobile)

### 1. Boundary placement

- Keep `useForm` orchestration in page/container hooks (`src/hooks/**`) or page-level
  containers.
- Keep presentational components library-agnostic: they receive `value`, `onChange`,
  `onBlur`, `error`, `disabled`, and submit callbacks via props.
- Do not move API calls into presentational components. Submit handlers continue to call
  service/store boundaries per ADR 0024.

### 2. Validation model

- Define client-side schemas for UX validation with Zod.
- Map validated form values into canonical transport DTOs from `@todos/core/http` at
  service/store boundaries.
- Do not replace backend validation contracts; backend responses still drive final error
  handling.

### 3. Platform specifics

- **Web:** prefer native input registration where practical; use `Controller` when wrapping
  custom inputs/components.
- **Mobile (React Native):** use `Controller` as the default adapter for `TextInput`-based
  components.
- Keep field naming, error-key conventions, and submit-state handling equivalent across both
  apps.

### 4. Testing strategy

- Unit test presentational form components in isolation using prop-driven states.
- Unit/integration test container hooks/components for:
  - schema validation messaging;
  - submit success/failure paths;
  - backend error mapping behavior.
- Avoid asserting internal RHF implementation details; test observable UI behavior.

## Incremental Migration Strategy

1. **Pilot on auth forms** (`login`, `register`) in both apps to validate cross-platform
   conventions against existing flows from PR #80 and PR #55.
2. **Extract shared conventions** (error mapping helpers, field adapter patterns, test
   helpers) after pilot parity is proven.
3. **Adopt for new complex forms first**, then refactor existing forms opportunistically when
   touching related code.
4. **Retain trivial forms on local state** until complexity justifies migration.

## Follow-Up PBIs

1. Add dependencies in `apps/web` and `apps/mobile`:
   - `react-hook-form`
   - `@hookform/resolvers`
   - `zod`
2. Create platform-specific container-hook conventions:
   - `apps/web/src/hooks/forms/**`
   - `apps/mobile/src/hooks/forms/**`
3. Implement pilot migrations for login/register forms in both apps with parity tests.
4. Add shared error mapping guidance for backend validation responses to field/form errors.
5. Update UI development documentation with a "when to use RHF vs local state" checklist.

## Consequences

- New non-trivial forms gain consistent state/validation behavior across web and mobile.
- Team onboarding improves through one documented pattern.
- Existing small forms are not forced into unnecessary migration work.
- Dependency surface increases modestly, but with clear payoff in consistency and scale.
