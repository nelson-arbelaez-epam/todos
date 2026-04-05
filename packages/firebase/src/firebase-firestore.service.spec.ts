import type { App } from 'firebase-admin/app';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FirebaseFirestoreService } from './firebase-firestore.service';

const firestoreMock = {
  collection: vi.fn(),
};

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => firestoreMock),
}));

describe('FirebaseFirestoreService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns firestore client instance', () => {
    const service = new FirebaseFirestoreService({} as App);

    expect(service.firestore).toBe(firestoreMock);
  });

  it('returns typed collection from path', () => {
    const todosCollection = { id: 'todos' };
    firestoreMock.collection.mockReturnValue(todosCollection);

    const service = new FirebaseFirestoreService({} as App);
    const result = service.getCollection('todos');

    expect(result).toBe(todosCollection);
    expect(firestoreMock.collection).toHaveBeenCalledWith('todos');
  });
});
