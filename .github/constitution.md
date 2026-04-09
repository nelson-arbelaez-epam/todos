# Project Constitution

This document outlines the core principles, standards, and guidelines for the Todos project to ensure consistency, maintainability, and quality across all components.

## Architecture Principles

- **Monorepo Structure**: The project uses a monorepo with apps and shared packages.
- **Modular Design**: Separate concerns into bounded packages (`@todos/core`, `@todos/store`, `@todos/firebase`, `@todos/shared`) with contracts in core and adapters at the edges.
- **API Consistency**: All APIs follow RESTful principles with consistent error handling and response formats.
- **API Documentation**: All API applications must integrate Swagger/OpenAPI for automatic documentation generation and endpoint exposure.
- **DTO Documentation Contract**: API transport DTOs (request/response models exposed by endpoints) must use Swagger decorators to produce complete OpenAPI schemas. Keep domain DTO primitives in `@todos/core` framework-agnostic.

## Package Responsibilities

- **Apps are Composition-Only**: Code under `apps/**` must wire modules, expose transport endpoints, and host runtime configuration only. Business logic and infrastructure adapters must live in packages. Temporary deviations must be tracked in ADRs and issues, not embedded as standing exceptions in this constitution.
- **@todos/core Owns Domain Contracts**: `@todos/core` is the source of truth for business objects, repository contracts, and shared domain DTO primitives.
- **@todos/store Owns Store Layer Logic**: `@todos/store` provides store services and module wiring for repository-backed business operations and depends only on domain contracts.
- **@todos/firebase Owns Firebase Infrastructure**: `@todos/firebase` owns Firebase app setup, auth/firestore services (including user creation, login proxy coordination, token verification, and user lookups), and Firebase repository adapters that implement `@todos/core` contracts. All Firebase auth integration and Firebase Admin SDK operations must go through this package; `apps/**` must not initialise or import the SDK directly nor host Firebase-specific auth coordination.
- **@todos/shared Owns Cross-App Infrastructure**: `@todos/shared` provides cross-cutting app utilities (for example health checks, global filters, shared assets) that are not business-domain ownership.
- **No Circular Dependencies**: `@todos/store` and `@todos/firebase` must not depend on each other directly. Integration must happen through `@todos/core` repository tokens/contracts.
- **ADR Compliance**: Storage/auth implementations must respect accepted ADR decisions, especially backend-only Firestore access, API-enforced authorization, and the package boundary for Firebase Admin-backed capabilities. Sign-in is API-mediated via the Firebase Identity Toolkit REST API proxy (ADR 0019); Firebase Admin wiring lives in `@todos/firebase` (ADR 0020); token refresh remains client-side.

## Coding Standards

- **Language**: TypeScript for all code.
- **Framework**: NestJS for backend applications; preserve existing framework choices in non-backend apps.
- **Linting**: Use Biome for code formatting and linting.
- **Testing**: Vitest for unit and integration tests. Aim for high coverage.
- **Naming Conventions**:
  - Classes: PascalCase
  - Methods/Functions: camelCase
  - Files: kebab-case.ts
  - Constants: UPPER_SNAKE_CASE

## Development Practices

- **Version Control**: Git with conventional commits.
- **Dependencies**: Use Yarn for package management.
- **Code Reviews**: All changes require review.
- **Documentation**: Maintain READMEs and inline comments for complex logic.

## Quality Assurance

- **Testing**: Write tests for all new features and bug fixes.
- **Type Safety**: Leverage TypeScript's type system fully. Avoid `any` types.
- **Error Handling**: Implement global exception filters with comprehensive logging in all NestJS applications.
- **Performance**: Optimize for performance and scalability.
- **Test Coverage**: Maintain 90% unit test coverage and at least 50% integration test coverage in all commits.

## UI Architecture

Formalised in [ADR 0021](../docs/adr/0021-ui-architecture-atomic-design-postcss-tailwind.md). The rules below apply to all UI code in `apps/web` and `apps/mobile`.

### Component Isolation

Components are split into two categories with strict boundaries:

- **Presentational components** receive all data and callbacks via props, own no business state, make no API or store calls, and are fully reusable and side-effect-free.
- **Container/Composition components** wire presentational components to data sources (hooks, stores, router). They live at page or feature boundaries and must stay thin — business logic belongs in hooks or services, not in JSX.
- A presentational component **must not** import a container component. Containers may import presentational components.

### Atomic Design Taxonomy

Organise components using Atomic Design adapted to this project:

| Level | Description | Examples | Location |
| --- | --- | --- | --- |
| **Atoms** | Smallest, indivisible UI units | Button, Input, Label, Icon | `src/components/atoms/` |
| **Molecules** | Distinct units composed of atoms | FormField, TodoItem | `src/components/molecules/` |
| **Organisms** | Self-contained sections composed of molecules/atoms | TodoList, AuthForm, NavBar | `src/components/organisms/` |
| **Templates** | Page-level layout wrappers; no data fetching | MainLayout, AuthLayout | `src/components/templates/` |
| **Pages** | Route-bound containers that wire data into templates/organisms | Home, About, Login | `src/pages/` |

Import direction is strictly top-down: atoms ← molecules ← organisms ← templates ← pages. Cross-cutting hooks live in `src/hooks/`; shared types live in `src/types/` or in `@todos/core` for domain contracts.

### Styling: PostCSS and Tailwind-like Utilities

- **PostCSS** is the standard CSS processing pipeline (configured via `postcss.config.js` at the app root). Vite provides built-in PostCSS support.
- **CSS custom properties** (design tokens) are defined in a central `:root` block for colours, spacing, and typography. All component styles reference these tokens.
- **CSS Modules** (co-located `.module.css` files) are the default for component-scoped styles to prevent cascade bleed.
- **Tailwind CSS** is the preferred utility-first framework for new component work in `apps/web`. Introduce it incrementally; its configuration must extend — not override — the existing CSS custom property token values.
- **NativeWind** is the equivalent path for `apps/mobile` utility-class styling (deferred until a dedicated PBI).
- Do not mix inline `style` props and utility classes on the same element. Do not use `!important` overrides. Tailwind's `@apply` is discouraged outside of base-layer resets.

### Migration and Compatibility

- Existing `apps/web` pages and `apps/mobile` components remain valid. Apply the Atomic Design structure and component isolation rules to new work and opportunistic refactors.
- The current `apps/web/src/pages/` directory maps to the *Pages* level. New shared components are placed in the appropriate `src/components/<level>/` subfolder.
- PostCSS and CSS Modules are already available in the Vite setup; no additional tooling is required to start. Tailwind requires a one-time install (`tailwind`, `postcss`, `autoprefixer`) tracked in a dedicated PBI.

### UI Adoption Checklist

Use this checklist when reviewing or creating UI code in PRs:

- [ ] New components are placed in the correct Atomic Design level under `src/components/<atoms|molecules|organisms|templates>/` or `src/pages/`.
- [ ] Presentational components accept only props; no hooks that trigger side effects (fetch, store writes) are called inside them.
- [ ] Container/page components delegate rendering to presentational components and keep JSX minimal.
- [ ] Component styles use CSS Modules or Tailwind utility classes; no ad-hoc inline `style` props for layout/theme values.
- [ ] New design token values are added to the `:root` CSS custom property block (and mirrored in `tailwind.config.js` once Tailwind is adopted).
- [ ] Cross-app domain types go in `@todos/core`; UI-only types go in `src/types/`.
- [ ] Each new component has a corresponding unit test (Vitest + React Testing Library for web; React Native Testing Library for mobile).

## AI Consistency Rules

**When using AI assistance:**

- Always follow the established patterns in the codebase.
- Use `@todos/core` for shared business DTOs/contracts.
- Ensure code is type-safe and well-tested.
- Follow the coding standards outlined above.
- Prefer existing utilities over reinventing functionality.
