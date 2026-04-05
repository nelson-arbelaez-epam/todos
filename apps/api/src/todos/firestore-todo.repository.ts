import { Inject, Injectable } from '@nestjs/common';
import type { TodoEntity } from '@todos/dtos';
import {
  type CollectionReference,
  type DocumentData,
  type DocumentSnapshot,
  type Firestore,
  Timestamp,
} from 'firebase-admin/firestore';
import { FIRESTORE } from '../firebase/firebase-admin.providers';
import type {
  CreateTodoRecord,
  TodoRepository,
  UpdateTodoRecord,
} from './todo-repository';

type FirestoreTodoDocument = {
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Timestamp | Date | string;
  updatedAt: Timestamp | Date | string;
  archivedAt?: Timestamp | Date | string | null;
};

function getTodosCollectionPath(): string {
  return process.env.FIRESTORE_TODOS_COLLECTION || 'todos';
}

function omitUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as T;
}

@Injectable()
export class FirestoreTodoRepository implements TodoRepository {
  constructor(
    @Inject(FIRESTORE)
    private readonly firestore: Firestore,
  ) {}

  async create(input: CreateTodoRecord): Promise<TodoEntity> {
    const documentReference = this.collection.doc();
    const now = new Date();

    const document = omitUndefined({
      title: input.title,
      description: input.description,
      completed: input.completed ?? false,
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
    });

    await documentReference.set(document);

    return this.mapEntity(documentReference.id, document);
  }

  async update(
    id: string,
    input: UpdateTodoRecord,
  ): Promise<TodoEntity | null> {
    const documentReference = this.collection.doc(id);
    const snapshot = await documentReference.get();

    if (!snapshot.exists) {
      return null;
    }

    const updatePayload = omitUndefined({
      title: input.title,
      description: input.description,
      completed: input.completed,
      updatedAt: new Date(),
    });

    await documentReference.update(updatePayload);

    const updatedSnapshot = await documentReference.get();
    return this.mapSnapshot(updatedSnapshot);
  }

  async archive(id: string): Promise<TodoEntity | null> {
    const documentReference = this.collection.doc(id);
    const snapshot = await documentReference.get();

    if (!snapshot.exists) {
      return null;
    }

    await documentReference.update({
      archivedAt: new Date(),
      updatedAt: new Date(),
    });

    const updatedSnapshot = await documentReference.get();
    return this.mapSnapshot(updatedSnapshot);
  }

  async findById(id: string): Promise<TodoEntity | null> {
    const snapshot = await this.collection.doc(id).get();

    if (!snapshot.exists) {
      return null;
    }

    return this.mapSnapshot(snapshot);
  }

  async findAll(options?: {
    includeArchived?: boolean;
  }): Promise<TodoEntity[]> {
    let query = this.collection.orderBy('createdAt', 'desc');

    if (!options?.includeArchived) {
      query = query.where('archivedAt', '==', null);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((document) => this.mapSnapshot(document));
  }

  private get collection(): CollectionReference<DocumentData> {
    return this.firestore.collection(getTodosCollectionPath());
  }

  private mapSnapshot(snapshot: DocumentSnapshot<DocumentData>): TodoEntity {
    return this.mapEntity(
      snapshot.id,
      snapshot.data() as FirestoreTodoDocument,
    );
  }

  private mapEntity(id: string, document: FirestoreTodoDocument): TodoEntity {
    return {
      id,
      title: document.title,
      description: document.description,
      completed: document.completed,
      createdAt: this.toDate(document.createdAt),
      updatedAt: this.toDate(document.updatedAt),
      archivedAt: this.toDate(document.archivedAt),
    };
  }

  private toDate(value?: Timestamp | Date | string | null): Date | undefined {
    if (!value) {
      return undefined;
    }

    if (value instanceof Timestamp) {
      return value.toDate();
    }

    if (value instanceof Date) {
      return value;
    }

    return new Date(value);
  }
}
