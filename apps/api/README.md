# Todos API

NestJS API application for todo management.

## Firestore datasource

This app uses Firebase Admin SDK for Firestore access. The datasource is configured from environment variables and exposed through a repository adapter instead of an ORM.

### Environment

Copy the values from `.env.example` into your local environment.

Recommended local setup:

1. `cp apps/api/.env.example apps/api/.env`
2. Optionally create `apps/api/.env.local` for machine-specific overrides.
3. Fill in one credential strategy.

Supported credential strategies:

1. `FIREBASE_SERVICE_ACCOUNT_JSON`
2. `FIREBASE_PROJECT_ID` + `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`
3. `GOOGLE_APPLICATION_CREDENTIALS` using Application Default Credentials

Relevant variables:

- `PORT`: HTTP server port. Defaults to `3000`.
- `FIREBASE_PROJECT_ID`: Firebase project id.
- `FIREBASE_CLIENT_EMAIL`: Service account client email.
- `FIREBASE_PRIVATE_KEY`: Service account private key with `\n` escaped newlines.
- `FIREBASE_SERVICE_ACCOUNT_JSON`: Full service account JSON payload.
- `FIRESTORE_TODOS_COLLECTION`: Firestore collection path for todos. Defaults to `todos`.

### Local development

1. Install dependencies with `yarn install`.
2. Build shared workspace packages with `yarn workspace @todos/api deps:build`.
3. Provide one of the credential strategies above.
4. Start the API with `yarn workspace @todos/api start:dev`.

If you are using a local Google credentials file, point `GOOGLE_APPLICATION_CREDENTIALS` to that path before starting the server.

The API loads both `.env` and `.env.local` on startup, with `.env.local` values taking precedence.

If you are iterating on shared DTOs, run `yarn workspace @todos/dtos build:watch` in a second terminal.

### Endpoints

- `GET /api/v1/todos`
- `GET /api/v1/todos/:id`
- `POST /api/v1/todos`
- `PATCH /api/v1/todos/:id`
- `POST /api/v1/todos/:id/archive`

### Tests

Run API tests with:

```bash
yarn workspace @todos/api test
```
