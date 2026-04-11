# ADR 0023 - Shared Branding Assets in @todos/branding

- Status: Accepted
- Date: 2026-04-11
- Related: GitHub Issue #38, PR #53, Constitution package responsibilities

## Context

After removing `@todos/shared`, the repository no longer has a cross-app package for static assets.
At the same time, API docs favicon, web favicon, and mobile icon generation must use a single
source of truth to avoid brand drift and repeated asset copies.

The current constitution positions `@todos/core` around domain contracts, while apps own
application-specific assets. The favicon needed by API, web, and mobile is not app-specific and
would otherwise be duplicated in each app.

## Decision

Create a dedicated package `@todos/branding` for shared design assets and tokens used by
multiple apps.

The package is responsible for:

1. Shared static assets such as `favicon.svg`.
2. Shared PostCSS/CSS custom-property design tokens.
3. Stable import surfaces for app runtimes and tooling scripts.

App-specific assets remain owned by each app under `apps/**`.

For this change, `favicon.svg` and `tokens.css` are stored in `packages/branding/src/` and consumed
by API, web, and mobile tooling.

## Consequences

### Positive

- Establishes a single source of truth for shared branding assets.
- Establishes a central source of truth for shared design tokens.
- Removes duplicated favicon/icon assets and ad-hoc copies.
- Keeps removal of `@todos/shared` intact while preserving explicit ownership.

### Negative

- Introduces one additional workspace package to maintain.
- Requires discipline to avoid turning `@todos/branding` into a generic catch-all package.

## Guardrails

- Only shared design assets and tokens are allowed in `@todos/branding`.
- Non-brand shared utilities must not be added under this exception.
- New shared brand asset categories require explicit ADR update or superseding ADR.
