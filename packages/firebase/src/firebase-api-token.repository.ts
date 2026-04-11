import { Inject, Injectable } from '@nestjs/common';
import type {
  ApiTokenEntity,
  ApiTokenRepository,
  CreateApiTokenInput,
} from '@todos/core';
import type { DocumentData } from 'firebase-admin/firestore';
import { FIREBASE_MODULE_OPTIONS } from './firebase.constants';
import { FirebaseFirestoreService } from './firebase-firestore.service';
import type { FirebaseModuleOptions } from './firebase-module-options';

interface FirestoreApiTokenDocument {
  tokenId: string;
  ownerUid: string;
  label: string;
  scopes: string[];
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
}

@Injectable()
export class FirebaseApiTokenRepository implements ApiTokenRepository {
  private readonly collectionPath: string;

  constructor(
    private readonly firestoreService: FirebaseFirestoreService,
    @Inject(FIREBASE_MODULE_OPTIONS)
    options: FirebaseModuleOptions,
  ) {
    this.collectionPath = options.apiTokensCollectionPath ?? 'api_tokens';
  }

  async create(input: CreateApiTokenInput): Promise<ApiTokenEntity> {
    const now = new Date();
    const collection =
      this.firestoreService.getCollection<FirestoreApiTokenDocument>(
        this.collectionPath,
      );

    const ref = collection.doc(input.tokenId);
    const document: FirestoreApiTokenDocument = {
      tokenId: input.tokenId,
      ownerUid: input.ownerUid,
      label: input.label,
      scopes: input.scopes,
      tokenHash: input.tokenHash,
      createdAt: now,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      lastUsedAt: null,
      revokedAt: null,
    };

    await ref.set(document);

    return this.toEntity(document);
  }

  async findByHash(tokenHash: string): Promise<ApiTokenEntity | null> {
    const collection =
      this.firestoreService.getCollection<FirestoreApiTokenDocument>(
        this.collectionPath,
      );

    const snapshot = await collection
      .where('tokenHash', '==', tokenHash)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return this.toEntity(doc.data());
  }

  async findAllByOwner(ownerUid: string): Promise<ApiTokenEntity[]> {
    const collection =
      this.firestoreService.getCollection<FirestoreApiTokenDocument>(
        this.collectionPath,
      );

    const snapshot = await collection
      .where('ownerUid', '==', ownerUid)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => this.toEntity(doc.data()));
  }

  async revoke(
    ownerUid: string,
    tokenId: string,
  ): Promise<ApiTokenEntity | null> {
    const collection =
      this.firestoreService.getCollection<FirestoreApiTokenDocument>(
        this.collectionPath,
      );

    const ref = collection.doc(tokenId);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return null;
    }

    const data = snapshot.data();
    if (!data || data.ownerUid !== ownerUid) {
      return null;
    }

    const revokedAt = new Date();
    await ref.update({ revokedAt });

    return this.toEntity({ ...data, revokedAt });
  }

  async updateLastUsedAt(tokenId: string): Promise<void> {
    const collection =
      this.firestoreService.getCollection<FirestoreApiTokenDocument>(
        this.collectionPath,
      );

    await collection.doc(tokenId).update({ lastUsedAt: new Date() });
  }

  private toEntity(data: FirestoreApiTokenDocument): ApiTokenEntity {
    return {
      tokenId: data.tokenId,
      ownerUid: data.ownerUid,
      label: data.label,
      scopes: data.scopes as ApiTokenEntity['scopes'],
      tokenHash: data.tokenHash,
      createdAt: this.normalizeDate(data.createdAt).toISOString(),
      expiresAt: data.expiresAt
        ? this.normalizeDate(data.expiresAt).toISOString()
        : null,
      lastUsedAt: data.lastUsedAt
        ? this.normalizeDate(data.lastUsedAt).toISOString()
        : null,
      revokedAt: data.revokedAt
        ? this.normalizeDate(data.revokedAt).toISOString()
        : null,
    };
  }

  private normalizeDate(value: Date | DocumentData): Date {
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
