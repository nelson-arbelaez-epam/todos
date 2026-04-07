import { Test } from '@nestjs/testing';
import { TODO_REPOSITORY } from '@todos/core';
import { getApps } from 'firebase-admin/app';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FIREBASE_ADMIN_APP,
  FIREBASE_MODULE_OPTIONS,
} from './firebase.constants';
import { FirebaseModule } from './firebase.module';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirebaseFirestoreService } from './firebase-firestore.service';
import { FirebaseTodoRepository } from './firebase-todo.repository';

const appInstance = { name: 'mock-app' };

vi.mock('firebase-admin/app', () => ({
  getApps: vi.fn(() => [appInstance]),
  getApp: vi.fn(() => appInstance),
  initializeApp: vi.fn(() => appInstance),
  applicationDefault: vi.fn(() => ({ projectId: 'default-project' })),
  cert: vi.fn(() => ({ projectId: 'cert-project' })),
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(() => ({ verifyIdToken: vi.fn(), getUser: vi.fn() })),
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({ collection: vi.fn() })),
}));

describe('FirebaseModule', () => {
  beforeEach(() => {
    vi.mocked(getApps).mockReturnValue([appInstance] as never);

    delete process.env.FIREBASE_TODOS_COLLECTION;
    delete process.env.FIRESTORE_TODOS_COLLECTION;
    delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PRIVATE_KEY;
    delete process.env.FIREBASE_PROJECT_ID;
  });

  it('auto-configures firebase options and providers', async () => {
    process.env.FIREBASE_TODOS_COLLECTION = 'todos';

    const moduleRef = await Test.createTestingModule({
      imports: [FirebaseModule],
    }).compile();

    expect(moduleRef.get(FirebaseAuthService)).toBeDefined();
    expect(moduleRef.get(FirebaseFirestoreService)).toBeDefined();
    expect(moduleRef.get(FirebaseTodoRepository)).toBeDefined();
    expect(moduleRef.get(TODO_REPOSITORY)).toBe(
      moduleRef.get(FirebaseTodoRepository),
    );
    expect(moduleRef.get(FIREBASE_ADMIN_APP)).toEqual(appInstance);
    expect(moduleRef.get(FIREBASE_MODULE_OPTIONS)).toMatchObject({
      todosCollectionPath: 'todos',
    });

    delete process.env.FIREBASE_TODOS_COLLECTION;
  });

  it('supports legacy FIRESTORE_TODOS_COLLECTION env key', async () => {
    process.env.FIRESTORE_TODOS_COLLECTION = 'legacy-todos';

    const moduleRef = await Test.createTestingModule({
      imports: [FirebaseModule],
    }).compile();

    expect(moduleRef.get(FIREBASE_MODULE_OPTIONS)).toMatchObject({
      todosCollectionPath: 'legacy-todos',
    });
  });

  it('throws a descriptive error when FIREBASE_SERVICE_ACCOUNT_JSON is invalid', async () => {
    vi.mocked(getApps).mockReturnValue([] as never);
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = '{invalid json';

    await expect(
      Test.createTestingModule({
        imports: [FirebaseModule],
      }).compile(),
    ).rejects.toThrow('Invalid FIREBASE_SERVICE_ACCOUNT_JSON');
  });

  it('throws when only one explicit credential field is provided', async () => {
    vi.mocked(getApps).mockReturnValue([] as never);
    process.env.FIREBASE_CLIENT_EMAIL = 'svc@project.iam.gserviceaccount.com';

    await expect(
      Test.createTestingModule({
        imports: [FirebaseModule],
      }).compile(),
    ).rejects.toThrow(
      'FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must both be provided',
    );
  });

  it('throws when explicit credentials are provided without project id', async () => {
    vi.mocked(getApps).mockReturnValue([] as never);
    process.env.FIREBASE_CLIENT_EMAIL = 'svc@project.iam.gserviceaccount.com';
    process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\n...';

    await expect(
      Test.createTestingModule({
        imports: [FirebaseModule],
      }).compile(),
    ).rejects.toThrow(
      'FIREBASE_PROJECT_ID is required when using FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.',
    );
  });
});
