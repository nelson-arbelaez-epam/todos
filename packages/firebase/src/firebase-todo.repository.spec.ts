import type { TodoEntity } from '@todos/core';
import { describe, expect, it } from 'vitest';
import { FirebaseFirestoreService } from './firebase-firestore.service';
import type { FirebaseModuleOptions } from './firebase-module-options';
import { FirebaseTodoRepository } from './firebase-todo.repository';

type TodoDoc = {
  ownerId: string;
  title: string;
  description?: string;
  completed: boolean;
  archivedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type Store = Map<string, TodoDoc>;

function createRepository(initialStore?: Store): {
  repository: FirebaseTodoRepository;
  store: Store;
} {
  const store = initialStore ?? new Map<string, TodoDoc>();
  let idCounter = 1;

  const collection = {
    doc: (id?: string) => {
      const docId = id ?? `todo-${idCounter++}`;

      return {
        id: docId,
        set: async (value: TodoDoc) => {
          store.set(docId, value);
        },
        get: async () => {
          const value = store.get(docId);
          return {
            id: docId,
            exists: Boolean(value),
            data: () => value,
          };
        },
        update: async (value: Partial<TodoDoc>) => {
          const current = store.get(docId);
          if (!current) {
            return;
          }
          store.set(docId, { ...current, ...value });
        },
        delete: async () => {
          store.delete(docId);
        },
      };
    },
    where: (field: string, _op: string, expected: unknown) => {
      const filters: Array<{ field: string; expected: unknown }> = [
        { field, expected },
      ];

      const buildQuery = () => ({
        where: (nextField: string, _nextOp: string, nextExpected: unknown) => {
          filters.push({ field: nextField, expected: nextExpected });
          return buildQuery();
        },
        get: async () => ({
          docs: Array.from(store.entries())
            .filter(([, value]) =>
              filters.every(
                (filter) =>
                  (value as Record<string, unknown>)[filter.field] ===
                  filter.expected,
              ),
            )
            .map(([id, value]) => ({
              id,
              data: () => value,
            })),
        }),
      });

      return buildQuery();
    },
  };

  const firestoreService = {
    getCollection: () => collection,
  } as unknown as FirebaseFirestoreService;

  const options: FirebaseModuleOptions = {
    todosCollectionPath: 'todos',
  };

  return {
    repository: new FirebaseTodoRepository(firestoreService, options),
    store,
  };
}

describe('FirebaseTodoRepository', () => {
  it('creates and returns todo entity', async () => {
    const { repository } = createRepository();

    const result = await repository.create('owner-1', {
      title: 'Buy milk',
      completed: false,
    });

    expect(result.id).toBeDefined();
    expect(result.title).toBe('Buy milk');
    expect(result.completed).toBe(false);
  });

  it('omits undefined description on create payload', async () => {
    const { repository, store } = createRepository();

    const created = await repository.create('owner-1', {
      title: 'No description',
    });

    const persisted = store.get(created.id);
    expect(persisted).toBeDefined();
    expect(persisted).not.toHaveProperty('description');
  });

  it('finds todo by id only for owner', async () => {
    const { repository } = createRepository();
    const created = await repository.create('owner-1', { title: 'Task' });

    await expect(
      repository.findById('owner-1', created.id),
    ).resolves.toMatchObject({
      id: created.id,
      title: 'Task',
    });

    await expect(
      repository.findById('owner-2', created.id),
    ).resolves.toBeNull();
  });

  it('lists todos by owner', async () => {
    const { repository } = createRepository();

    await repository.create('owner-1', { title: 'A' });
    await repository.create('owner-1', { title: 'B' });
    await repository.create('owner-2', { title: 'C' });

    const todos = await repository.findAll('owner-1');

    expect(todos).toHaveLength(2);
    expect(todos.map((todo: TodoEntity) => todo.title)).toEqual(['A', 'B']);
  });

  it('excludes archived todos by default and includes them on demand', async () => {
    const { repository } = createRepository();

    const active = await repository.create('owner-1', { title: 'Active' });
    const archived = await repository.create('owner-1', { title: 'Archived' });

    await repository.archive('owner-1', archived.id);

    const defaultList = await repository.findAll('owner-1');
    const withArchived = await repository.findAll('owner-1', {
      includeArchived: true,
    });

    expect(defaultList.map((todo) => todo.id)).toEqual([active.id]);
    expect(withArchived.map((todo) => todo.id).sort()).toEqual(
      [active.id, archived.id].sort(),
    );
  });

  it('updates todo only when owner matches', async () => {
    const { repository } = createRepository();
    const created = await repository.create('owner-1', { title: 'A' });

    await expect(
      repository.update('owner-2', created.id, { title: 'B' }),
    ).resolves.toBeNull();

    await expect(
      repository.update('owner-1', created.id, { title: 'B' }),
    ).resolves.toMatchObject({
      id: created.id,
      title: 'B',
    });
  });

  it('does not overwrite existing fields with undefined on update', async () => {
    const { repository } = createRepository();
    const created = await repository.create('owner-1', {
      title: 'A',
      description: 'keep-me',
    });

    const updated = await repository.update('owner-1', created.id, {
      title: 'B',
      description: undefined,
    });

    expect(updated).toMatchObject({
      id: created.id,
      title: 'B',
      description: 'keep-me',
    });
  });

  it('deletes todo only when owner matches', async () => {
    const { repository } = createRepository();
    const created = await repository.create('owner-1', { title: 'A' });

    await expect(repository.delete('owner-2', created.id)).resolves.toBe(false);
    await expect(repository.delete('owner-1', created.id)).resolves.toBe(true);
    await expect(
      repository.findById('owner-1', created.id),
    ).resolves.toBeNull();
  });

  it('archives todo only when owner matches', async () => {
    const { repository } = createRepository();
    const created = await repository.create('owner-1', { title: 'A' });

    await expect(repository.archive('owner-2', created.id)).resolves.toBeNull();
    await expect(
      repository.archive('owner-1', created.id),
    ).resolves.toMatchObject({
      id: created.id,
    });
  });
});
