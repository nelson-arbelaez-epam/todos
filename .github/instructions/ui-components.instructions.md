---
applyTo: "**/*.{tsx,jsx}"
---

# UI Component Guidelines

All `.tsx` and `.jsx` files must follow the UI Architecture rules formalised in
[ADR 0021](../../docs/adr/0021-ui-architecture-atomic-design-postcss-tailwind.md)
and the [Project Constitution – UI Architecture section](../constitution.md#ui-architecture).

## Component Isolation

- **Presentational components** must accept all data and callbacks via props only.
  - No `useEffect`, `fetch`, store subscriptions, or router side-effects inside a presentational component.
  - Fully reusable, side-effect-free, and independently testable.
- **Container/Composition components** (pages, feature roots) wire presentational components to data sources (hooks, stores, router).
  - Keep JSX in containers minimal — delegate rendering to presentational components.
  - Business logic belongs in dedicated hooks (`src/hooks/`), not inline in JSX.
- A presentational component **must not** import a container component. Containers may import presentational components.

## Atomic Design Folder Placement

Place every new component in the correct level **before** writing its implementation:

| Component type | Folder |
| --- | --- |
| Atom (Button, Input, Icon, Label, Badge, …) | `src/components/atoms/` |
| Molecule (FormField, TodoItem, SearchBar, …) | `src/components/molecules/` |
| Organism (TodoList, AuthForm, NavBar, …) | `src/components/organisms/` |
| Template (layout wrappers, no data fetching) | `src/components/templates/` |
| Page (route-bound container) | `src/pages/` |

Import direction is strictly top-down — an atom must not import from a molecule, organism, template, or page.

## Styling Rules

- Use **CSS Modules** (co-located `.module.css`) for component-scoped styles; do not add unscoped class names to global stylesheets.
- Use **Tailwind CSS utility classes** for new components once Tailwind is installed; do not invent ad-hoc utility classes.
- Reference **CSS custom properties** (design tokens from `:root`) for colour, spacing, and typography values — do not hard-code raw values.
- Do **not** mix inline `style` props and utility/module classes on the same element.
- Do **not** use `!important` overrides.
- Tailwind's `@apply` is discouraged outside of base-layer resets (e.g., global styles inside `@layer base { … }` in a root CSS file); compose utility classes in JSX instead.

## Testing

- Every new `.tsx`/`.jsx` component must have a co-located or `__tests__`-adjacent unit test file.
  - `apps/web`: use **Vitest** + **React Testing Library**.
  - `apps/mobile`: use **Vitest** + **React Native Testing Library**.
- Test presentational components in isolation (no mocked stores or routers unless the component explicitly requires them).
- Test containers by mocking data hooks and verifying that the correct presentational components receive the correct props.

## Quick Checklist (apply before every commit touching a `.tsx`/`.jsx` file)

- [ ] Component is in the correct Atomic Design folder.
- [ ] Presentational components are free of side-effect hooks and store/API calls.
- [ ] Containers keep JSX thin; logic lives in hooks.
- [ ] Styles use CSS Modules or Tailwind utilities; no raw inline `style` for layout/theme values.
- [ ] Design tokens reference CSS custom properties.
- [ ] A unit test exists (or is updated) for this component.
- [ ] No atom/molecule/organism imports a higher-level component.
