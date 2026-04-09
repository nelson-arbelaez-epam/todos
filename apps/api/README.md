# Todos API

NestJS API application for todo management.

## Firestore datasource

This app uses Firebase Admin SDK for Firestore access. The datasource is configured from environment variables and exposed through a repository adapter instead of an ORM.

### Local development

1. Install dependencies with `yarn install`.
2. Build shared workspace packages with `yarn workspace @todos/api deps:build`.
3. Provide one credential strategy:
    - `FIREBASE_SERVICE_ACCOUNT_JSON` with raw service account JSON.
    - `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` + `FIREBASE_PROJECT_ID`.
    - Application Default Credentials via `GOOGLE_APPLICATION_CREDENTIALS`.
4. Set `FIREBASE_WEB_API_KEY` to your Firebase project's Web API key (found in the Firebase console under Project Settings → General). This is required for the login endpoint.
5. Start the API with `yarn workspace @todos/api start:dev`.

If you are using a local Google credentials file, point `GOOGLE_APPLICATION_CREDENTIALS` to that path before starting the server.

The API loads both `.env` and `.env.local` on startup, with `.env.local` values taking precedence.

If you are iterating on shared core contracts, run `yarn workspace @todos/core build:dev` in a second terminal.

Collection path is configured with `FIREBASE_TODOS_COLLECTION`.

## Auth endpoints

### `POST /api/v1/auth/register`

Registers a new user with email and password via Firebase Admin Auth.

**Request body**

```json
{
  "email": "user@example.com",
  "password": "strongPassword123"
}
```

**Response `201`**

```json
{
  "uid": "uid1234567890",
  "email": "user@example.com"
}
```

**Error responses**

| Status | Reason |
| ------ | ------ |
| 400 | Invalid email format or password too weak |
| 409 | Email is already registered |

---

### `POST /api/v1/auth/login`

Authenticates a user with email and password and returns a Firebase ID token (JWT).

**Request body**

```json
{
  "email": "user@example.com",
  "password": "strongPassword123"
}
```

**Response `200`**

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ii...",
  "email": "user@example.com",
  "expiresIn": "3600",
  "uid": "uid1234567890"
}
```

**Error responses**

| Status | Reason |
| ------ | ------ |
| 400 | Invalid request payload |
| 401 | Invalid credentials (wrong email or password) |

### Tests

Run API tests with:

```bash
yarn workspace @todos/api test
```
