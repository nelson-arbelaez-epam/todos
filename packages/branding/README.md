# @todos/branding

Shared cross-app branding assets and design tokens.

## Exports

- `@todos/branding/favicon.svg`
- `@todos/branding/tokens.css`

## Usage

Web app (Vite):

```ts
import faviconUrl from '@todos/branding/favicon.svg?url';
import '@todos/branding/tokens.css';
```

Node scripts / API bootstrap:

```ts
const path = require.resolve('@todos/branding/favicon.svg');
```
