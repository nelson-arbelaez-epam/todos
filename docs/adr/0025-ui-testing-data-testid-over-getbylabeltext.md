# ADR 0025 - UI Testing: Prefer data-testid over getByLabelText

- **Status:** Accepted
- **Date:** 2026-04-12
- **Related:** ADR 0021 (Atomic Design); [UI Component Guidelines](../../.github/instructions/ui-components.instructions.md)

## Context

Form field testing in React Testing Library often relies on `getByLabelText()` to find inputs by their associated label text. However, this coupling creates test fragility:

- **Label text changes** (e.g., adding "required" indicator) break tests
- **Localization** changes require test updates
- **Minor UI tweaks** (adding asterisks, abbreviations) cause test failures
- **Intent becomes unclear** — tests check implementation details rather than test purposes

React Testing Library's documentation endorses `data-testid` as a deliberate test interface:
> "Use `data-testid` when other queries are insufficient. This explicitly declares testing intent."

## Decision

### 1. Prefer data-testid for FormField Inputs

Form fields (across atoms, molecules, organisms) **shall use `data-testid` on input elements**, specifically to avoid coupling tests to label text variations.

**Pattern:**

```tsx
// In FormField molecule:
<Input id="email" data-testid="form-field--email" {...props} />

// In tests:
await user.type(screen.getByTestId('form-field--email'), 'user@example.com');
```

### 2. Replace getByLabelText with getByTestId in Tests

All existing `getByLabelText()` calls in FormField and RegisterForm tests **shall be replaced with `getByTestId()`**.

**Before:**

```typescript
await user.type(screen.getByLabelText(/Email/i), 'user@example.com');
```

**After:**

```typescript
await user.type(screen.getByTestId('form-field--email'), 'user@example.com');
```

### 3. Keep Semantic Queries Elsewhere

For atoms without form field coupling (Button, Text, NavBar, etc.):

- **Continue using semantic queries:** `getByRole()`, `getByText()`, `getByPlaceholder()`
- **Do not add data-testid** unless necessary for complex interactions

## Rationale

- **Explicit Intent:** `data-testid="form-field--email"` clearly states "this is the email input in a form field"
- **Decouples from Label Text:** Tests survive label changes (asterisks, i18n, UI tweaks)
- **Focused Scope:** Only applied to form fields where label text variance is common
- **Maintains Best Practices:** Semantic queries remain the default for accessible elements

## Consequences

### Positive

- Form field tests are stable across label text/styling changes
- Test intent is explicit: `getByTestId('form-field--email')` is self-documenting
- No need to update tests when accessibility indicators are added

### Negative

- Requires adding `data-testid` attributes to FormField inputs
- Developers must remember to add `data-testid={`form-field--${id}`}` to new form fields
- Slight additional verbosity in component markup

## Migration

1. Add `data-testid={`form-field--${id}`}` to Input elements in FormField molecule
2. Replace all `getByLabelText()` calls with `getByTestId()` in RadioForm and related component tests
3. Do not add `data-testid` to other components (Button, Text, NavBar) unless specific test needs emerge

## References

- [React Testing Library: getByTestId](https://testing-library.com/docs/queries/bytestid)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library#using-data-testid-as-an-escape-hatch)
