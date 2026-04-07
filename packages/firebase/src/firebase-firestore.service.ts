import { Inject, Injectable } from '@nestjs/common';
import type { App } from 'firebase-admin/app';
import {
  type CollectionReference,
  type DocumentData,
  type Firestore,
  getFirestore,
} from 'firebase-admin/firestore';
import { FIREBASE_ADMIN_APP } from './firebase.constants';

@Injectable()
export class FirebaseFirestoreService {
  private readonly firestoreClient: Firestore;

  constructor(@Inject(FIREBASE_ADMIN_APP) app: App) {
    this.firestoreClient = getFirestore(app);
  }

  get firestore(): Firestore {
    return this.firestoreClient;
  }

  getCollection<T extends DocumentData>(path: string): CollectionReference<T> {
    return this.firestoreClient.collection(path) as CollectionReference<T>;
  }
}
