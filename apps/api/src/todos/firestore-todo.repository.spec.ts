import type { Firestore } from 'firebase-admin/firestore';
import { Timestamp } from 'firebase-admin/firestore';
import { beforeEach, describe, expect, it } from 'vitest';
import { FirestoreTodoRepository } from './firestore-todo.repository';

type StoredTodo = Record<string, unknown>;

class MockDocumentSnapshot {
  constructor(
    readonly id: string,
    private readonly document?: StoredTodo,
  ) {}

  get exists(): boolean {
    return this.document !== undefined;
  }

  data(): StoredTodo | undefined {
    return this.document;
  }
}

class MockDocumentReference {
  constructor(
    readonly id: string,
    private readonly store: Map<string, StoredTodo>,
  ) {}

  async set(document: StoredTodo): Promise<void> {
    this.store.set(this.id, document);
  }

  async update(document: StoredTodo): Promise<void> {
    const existing = this.store.get(this.id);

    if (!existing) {
      throw new Error('Missing document');
    }

    this.store.set(this.id, {
      ...existing,
      ...document,
    });
  }

  async get(): Promise<MockDocumentSnapshot> {
    return new MockDocumentSnapshot(this.id, this.store.get(this.id));
  }
}

class MockQuery {
  constructor(
    private readonly store: Map<string, StoredTodo>,
    private readonly archivedOnlyNull = false,
  ) {}

  where(field: string, _operator: string, value: unknown): MockQuery {
    if (field === 'archivedAt' && value === null) {
      return new MockQuery(this.store, true);
    }

    return this;
  }

  orderBy(_field: string, _direction: string): MockQuery {
    return this;
  }

  async get(): Promise<{ docs: MockDocumentSnapshot[] }> {
    const docs = Array.from(this.store.entries())
      .filter(([, document]) => {
        if (!this.archivedOnlyNull) {
          return true;
        }

        return (document.archivedAt as unknown) === null;
      })
      .map(([id, document]) => new MockDocumentSnapshot(id, document));

    return { docs };
  }
}

class MockCollectionReference extends MockQuery {
  private nextId = 0;

  constructor(private readonly store: Map<string, StoredTodo>) {
    super(store);
  }

  doc(id?: string): MockDocumentReference {
    this.nextId += 1;
    return new MockDocumentReference(id ?? `todo-${this.nextId}`, this.store);
  }
}

describe('FirestoreTodoRepository', () => {
  let store: Map<string, StoredTodo>;
  let repository: FirestoreTodoRepository;

  beforeEach(() => {
    store = new Map<string, StoredTodo>();
    const collection = new MockCollectionReference(store);
    const firestore = {
      collection: () => collection,
    } as unknown as Firestore;

    repository = new FirestoreTodoRepository(firestore);
  });

  it('creates a todo with default archive state', async () => {
    const todo = await repository.create({
      title: 'Write tests',
      description: 'Repository mapping',
      completed: false,
    });

    expect(todo.id).toBeDefined();
    expect(todo.archivedAt).toBeUndefined();
    expect(store.get(todo.id)?.archivedAt).toBe(null);
  });

  it('updates an existing todo', async () => {
    store.set('todo-1', {
      title: 'Old title',
      completed: false,
      createdAt: new Date('2026-04-05T00:00:00.000Z'),
      updatedAt: new Date('2026-04-05T00:00:00.000Z'),
      archivedAt: null,
    });

    const todo = await repository.update('todo-1', {
      title: 'New title',
      completed: true,
    });

    expect(todo?.title).toBe('New title');
    expect(todo?.completed).toBe(true);
  });

  it('archives an existing todo', async () => {
    store.set('todo-1', {
      title: 'Archive me',
      completed: false,
      createdAt: new Date('2026-04-05T00:00:00.000Z'),
      updatedAt: new Date('2026-04-05T00:00:00.000Z'),
      archivedAt: null,
    });

    const todo = await repository.archive('todo-1');

    expect(todo?.archivedAt).toBeInstanceOf(Date);
  });

  it('filters archived todos by default', async () => {
    store.set('todo-1', {
      title: 'Visible todo',
      completed: false,
      createdAt: new Date('2026-04-05T00:00:00.000Z'),
      updatedAt: new Date('2026-04-05T00:00:00.000Z'),
      archivedAt: null,
    });
    store.set('todo-2', {
      title: 'Archived todo',
      completed: true,
      createdAt: new Date('2026-04-05T00:00:00.000Z'),
      updatedAt: new Date('2026-04-05T00:00:00.000Z'),
      archivedAt: new Date('2026-04-05T01:00:00.000Z'),
    });

    const todos = await repository.findAll();

    expect(todos).toHaveLength(1);
    expect(todos[0].title).toBe('Visible todo');
  });

  it('maps Firestore timestamps to dates', async () => {
    store.set('todo-1', {
      title: 'Timestamp todo',
      completed: false,
      createdAt: Timestamp.fromDate(new Date('2026-04-05T00:00:00.000Z')),
      updatedAt: Timestamp.fromDate(new Date('2026-04-05T01:00:00.000Z')),
      archivedAt: null,
    });

    const todo = await repository.findById('todo-1');

    expect(todo?.createdAt).toBeInstanceOf(Date);
    expect(todo?.updatedAt).toBeInstanceOf(Date);
  });
});
