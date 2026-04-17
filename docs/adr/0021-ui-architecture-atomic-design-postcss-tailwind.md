# ADR 0021 - UI Architecture: Atomic Design, Component Isolation, and PostCSS/Tailwind

- Status: Accepted
- Date: 2026-04-09
- Related: GitHub Issue #31; Constitution UI Architecture section

## Context

The project currently has two UI surfaces: `apps/web` (React + Vite) and `apps/mobile` (Expo/React Native). Both apps are early-stage and do not yet follow a formalised component architecture or styling strategy.

As the product grows, the absence of:

- Explicit rules on component isolation and ownership
- A consistent taxonomy for organising UI components
- A defined styling pipeline

will lead to inconsistent, hard-to-maintain UI code. Ad-hoc component structures inside page files, mixed presentational and container logic in the same file, and ungoverned style patterns are known sources of technical debt in frontend projects.

This ADR formalises three interlocking decisions for the Todos UI to address these concerns while remaining incremental and non-blocking for current delivery.

## Decision

### 1. Component Isolation: Presentational vs Container/Composition Boundaries

All React components are classified into two categories:

**Presentational components** (also called *UI components* or *dumb components*):

- Receive data and callbacks exclusively via props.
- Own no business state and make no direct API or store calls.
- Are fully reusable, side-effect-free, and easily testable.
- Represent the bulk of the component tree.

**Container/Composition components** (also called *smart components* or *page-level components*):

- Wire presentational components together.
- Own data-fetching, store subscriptions, or router-integration logic.
- Live at page or feature boundaries, not inside shared component libraries.
- Are kept as thin as possible — business logic belongs in services/hooks, not in JSX.

Boundary rule: a presentational component **must not** import a container component. Containers may import presentational components. Shared hooks that encapsulate side-effect logic are allowed to be consumed by both layers.

### 2. Atomic Design Taxonomy and Folder Organisation

Components are organised using the Atomic Design methodology adapted to this project:

| Level | Description | Examples | Location |
| --- | --- | --- | --- |
| **Atoms** | Smallest, indivisible UI units | Button, Input, Label, Icon, Badge | `src/components/atoms/` |
| **Molecules** | Combinations of atoms forming a distinct UI unit | FormField (Label + Input), TodoItem (Checkbox + Label) | `src/components/molecules/` |
| **Organisms** | Self-contained sections composed of molecules/atoms | TodoList, AuthForm, NavBar | `src/components/organisms/` |
| **Templates** | Page-level layout wrappers with slot-based composition; no data | MainLayout, AuthLayout | `src/components/templates/` |
| **Pages** | Route-bound components that wire data into templates/organisms | Home, About, Login | `src/pages/` |

Rules:

- Atoms must not import from molecules, organisms, templates, or pages.
- Molecules may import atoms only.
- Organisms may import molecules and atoms.
- Templates may import organisms, molecules, and atoms, but must not fetch data.
- Pages are containers — they fetch/subscribe to data and pass it into templates and organisms.
- Cross-cutting shared hooks live in `src/hooks/`.
- Cross-cutting shared types live in `src/types/` or in `@todos/core` if they are domain contracts.
- Atom consumers should import from the public atoms index (`src/components/atoms`) rather than deep atom implementation paths such as `src/components/atoms/AppLabel/AppLabel`.

### Atom primitives and base HTML elements

- Rule: Base HTML elements used for layout and semantic structure (for example `div`, `section`, `article`, `header`, `footer`, `nav`, `h1`-`h6`, `p`, `span`, `ul`, `li`) are considered UI primitives and should be implemented and exported as Atoms (for example `Box`, `Text`, `List`, `ListItem`). Molecules and Organisms must compose these atoms rather than using raw HTML tags directly.

- Rationale: Reserving base HTML tags for Atoms centralises styling, design-token usage, and accessibility attributes (for example role, aria-* and semantic element selection). Making these primitives atoms enables project-wide updates to tokens, typography, or semantics by changing a single, well-tested primitive.

 - Exceptions & Migration: New components must follow this pattern. Existing molecules and organisms that use raw HTML tags should be migrated opportunistically. Exceptions are discouraged and must be documented in a PR with justification. Consider adding a linter rule or codemod in a future PBI to detect raw HTML usage in `src/components/molecules/` and `src/components/organisms/`.

### 3. Styling: PostCSS Pipeline with Utility-Class Approach

The Todos web app uses Vite, which has built-in PostCSS support. The following decisions govern styling:

**Short term (current web app):**

- PostCSS is the standard CSS processing pipeline. Configure it via `postcss.config.js` at the app root.
- Nest CSS using native CSS nesting (already used in `App.css`; PostCSS `postcss-nesting` plugin is the fallback for wider browser support if needed).
- CSS custom properties (variables) are used for design tokens (colours, spacing, typography, etc.) in a central `:root` block.
- Component-scoped styles live in co-located `.module.css` files (CSS Modules) to prevent unintended cascade bleed.
- Utility classes are permitted but must not be invented ad-hoc: use a consistent set drawn from a single source (Tailwind CSS or a small hand-crafted token-driven utility layer).

**Tailwind CSS adoption path:**

- Tailwind CSS is the preferred utility-first framework for new component work in `apps/web`.
- Introduce Tailwind incrementally: install and configure it; new components use Tailwind utility classes; existing global styles migrate opportunistically.
- Tailwind configuration (`tailwind.config.js`) must extend, not override, the design token values defined as CSS custom properties so that both systems share the same token source.
- For `apps/mobile` (React Native/Expo), NativeWind is the equivalent solution and is the preferred path when utility-class styling is introduced there.

**Rules:**

- Do not mix inline `style` prop and utility classes on the same element.
- Do not use `!important` overrides.
- Tailwind's `@apply` directive is discouraged outside of base-layer resets; prefer composing utility classes in JSX.
- CSS Modules remain valid for components with complex, stateful, or animation-heavy styles where utility classes reduce readability.

## Consequences

- UI components in `apps/web` and `apps/mobile` will adopt the Atomic Design folder structure incrementally as new components are built or existing components are refactored.
- The presentational/container split is enforced by convention and code review, with the option to add an ESLint rule if violations become frequent.
- PostCSS and CSS Modules are already available in the Vite setup; no new tooling is required to begin.
- Tailwind CSS requires a one-time installation (`tailwind`, `postcss`, `autoprefixer`) and configuration; this is non-breaking and can be introduced in a dedicated PBI.
- NativeWind adoption in `apps/mobile` is deferred until a PBI specifically targets mobile styling improvements.
- Existing `src/pages/` files in `apps/web` are compatible with the new structure; new pages follow the template + organism composition pattern going forward.
- The constitution is updated to reference this ADR for UI architecture guidance.
