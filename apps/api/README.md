# Todos API

NestJS API application for todo management.

## Firestore datasource

This app uses Firebase Admin SDK for Firestore access. The datasource is configured from environment variables and exposed through a repository adapter instead of an ORM.

### Local development

1. Install dependencies with `yarn install`.
2. Build shared workspace packages with `yarn workspace @todos/api deps:build`.
3. Provide one of the credential strategies above.
4. Start the API with `yarn workspace @todos/api start:dev`.

If you are using a local Google credentials file, point `GOOGLE_APPLICATION_CREDENTIALS` to that path before starting the server.

The API loads both `.env` and `.env.local` on startup, with `.env.local` values taking precedence.

If you are iterating on shared core contracts, run `yarn workspace @todos/core build:dev` in a second terminal.

### Tests

Run API tests with:

```bash
yarn workspace @todos/api test
```
