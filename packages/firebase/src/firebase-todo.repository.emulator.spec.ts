import type { FirebaseFirestoreService } from './firebase-firestore.service';
import { FirebaseTodoRepository } from './firebase-todo.repository';
import { afterEach, describe, expect, it } from 'vitest';
import { deleteApp, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const describeIfEmulator = process.env.FIRESTORE_EMULATOR_HOST
  ? describe
  : describe.skip;

let app: App | undefined;

describeIfEmulator('FirebaseTodoRepository (emulator)', () => {
  afterEach(async () => {
    if (app) {
      await deleteApp(app);
      app = undefined;
    }
  });

  it('documents why repository strips undefined fields', async () => {
    app = initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID ?? 'todos-emulator',
    }, `todos-emulator-${Date.now()}`);

    const firestore = getFirestore(app);
    const collectionPath = `todos-emulator-${Date.now()}`;

    await expect(
      firestore.collection(collectionPath).doc('raw').set({
        ownerId: 'owner-1',
        title: 'raw',
        description: undefined,
      }),
    ).rejects.toThrow();

    const firestoreService = {
      getCollection: (path: string) => firestore.collection(path) as never,
    } as FirebaseFirestoreService;

    const repository = new FirebaseTodoRepository(firestoreService, {
      todosCollectionPath: collectionPath,
    });

    const created = await repository.create('owner-1', {
      title: 'keep description',
      description: 'keep-me',
    });

    const updated = await repository.update('owner-1', created.id, {
      description: undefined,
      title: 'updated',
    });

    expect(updated).toMatchObject({
      id: created.id,
      title: 'updated',
      description: 'keep-me',
    });
  });
});
