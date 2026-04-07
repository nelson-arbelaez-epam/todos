import { Inject, Injectable } from '@nestjs/common';
import type {
  CreateTodoInput,
  FindTodosOptions,
  TodoEntity,
  TodoRepository,
  UpdateTodoInput,
} from '@todos/core';
import type { DocumentData } from 'firebase-admin/firestore';
import { FIREBASE_MODULE_OPTIONS } from './firebase.constants';
import { FirebaseFirestoreService } from './firebase-firestore.service';
import type { FirebaseModuleOptions } from './firebase-module-options';

interface FirestoreTodoDocument {
  ownerId: string;
  title: string;
  description?: string;
  completed: boolean;
  archivedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class FirebaseTodoRepository implements TodoRepository {
  private readonly collectionPath: string;

  constructor(
    private readonly firestoreService: FirebaseFirestoreService,
    @Inject(FIREBASE_MODULE_OPTIONS)
    options: FirebaseModuleOptions,
  ) {
    this.collectionPath = options.todosCollectionPath ?? 'todos';
  }

  async create(ownerId: string, input: CreateTodoInput): Promise<TodoEntity> {
    const now = new Date();
    const collection =
      this.firestoreService.getCollection<FirestoreTodoDocument>(
        this.collectionPath,
      );

    const ref = collection.doc();
    const document: FirestoreTodoDocument = {
      ownerId,
      title: input.title,
      completed: input.completed ?? false,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
    };

    await ref.set(document);

    return {
      id: ref.id,
      title: document.title,
      description: document.description,
      completed: document.completed,
      archivedAt: document.archivedAt ?? undefined,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  async findById(ownerId: string, id: string): Promise<TodoEntity | null> {
    const document = await this.firestoreService
      .getCollection<FirestoreTodoDocument>(this.collectionPath)
      .doc(id)
      .get();

    if (!document.exists) {
      return null;
    }

    const data = document.data();
    if (!data || data.ownerId !== ownerId) {
      return null;
    }

    return this.toTodoEntity(document.id, data);
  }

  async findAll(
    ownerId: string,
    options?: FindTodosOptions,
  ): Promise<TodoEntity[]> {
    const collection =
      this.firestoreService.getCollection<FirestoreTodoDocument>(
        this.collectionPath,
      );
    let query = collection.where('ownerId', '==', ownerId);

    if (!options?.includeArchived) {
      query = query.where('archivedAt', '==', null);
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => this.toTodoEntity(doc.id, doc.data()));
  }

  async update(
    ownerId: string,
    id: string,
    input: UpdateTodoInput,
  ): Promise<TodoEntity | null> {
    const documentRef = this.firestoreService
      .getCollection<FirestoreTodoDocument>(this.collectionPath)
      .doc(id);

    const currentDocument = await documentRef.get();
    if (!currentDocument.exists) {
      return null;
    }

    const currentData = currentDocument.data();
    if (!currentData || currentData.ownerId !== ownerId) {
      return null;
    }

    const payload = {
      ...input,
      updatedAt: new Date(),
    };

    const safePayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined),
    ) as Partial<FirestoreTodoDocument>;

    await documentRef.update(safePayload);

    const updatedDocument = await documentRef.get();
    if (!updatedDocument.exists) {
      return null;
    }

    const updatedData = updatedDocument.data();
    if (!updatedData) {
      return null;
    }

    return this.toTodoEntity(updatedDocument.id, updatedData);
  }

  async delete(ownerId: string, id: string): Promise<boolean> {
    const documentRef = this.firestoreService
      .getCollection<FirestoreTodoDocument>(this.collectionPath)
      .doc(id);
    const currentDocument = await documentRef.get();

    if (!currentDocument.exists) {
      return false;
    }

    const data = currentDocument.data();
    if (!data || data.ownerId !== ownerId) {
      return false;
    }

    await documentRef.delete();

    return true;
  }

  async archive(ownerId: string, id: string): Promise<TodoEntity | null> {
    const documentRef = this.firestoreService
      .getCollection<FirestoreTodoDocument>(this.collectionPath)
      .doc(id);
    const currentDocument = await documentRef.get();

    if (!currentDocument.exists) {
      return null;
    }

    const data = currentDocument.data();
    if (!data || data.ownerId !== ownerId) {
      return null;
    }

    await documentRef.update({
      archivedAt: new Date(),
      updatedAt: new Date(),
    });

    const archivedDocument = await documentRef.get();
    if (!archivedDocument.exists) {
      return null;
    }

    const archivedData = archivedDocument.data();
    if (!archivedData) {
      return null;
    }

    return this.toTodoEntity(archivedDocument.id, archivedData);
  }

  private toTodoEntity(id: string, data: FirestoreTodoDocument): TodoEntity {
    return {
      id,
      title: data.title,
      description: data.description,
      completed: data.completed,
      archivedAt: this.normalizeDate(data.archivedAt ?? undefined),
      createdAt: this.normalizeDate(data.createdAt),
      updatedAt: this.normalizeDate(data.updatedAt),
    };
  }

  private normalizeDate(
    value: Date | DocumentData | null | undefined,
  ): Date | undefined {
    if (!value) {
      return undefined;
    }

    if (value instanceof Date) {
      return value;
    }

    const timestampValue = value as { toDate?: () => Date };
    if (typeof timestampValue.toDate === 'function') {
      return timestampValue.toDate();
    }

    return new Date(String(value));
  }
}
