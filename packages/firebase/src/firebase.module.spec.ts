import { Test } from '@nestjs/testing';
import { TODO_REPOSITORY } from '@todos/core';
import { describe, expect, it, vi } from 'vitest';
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
  it('auto-configures firebase options and providers', async () => {
    process.env.FIRESTORE_TODOS_COLLECTION = 'todos';

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

    delete process.env.FIRESTORE_TODOS_COLLECTION;
  });
});
