import { Global, Module } from '@nestjs/common';
import { TODO_REPOSITORY } from '@todos/core';
import {
  App,
  applicationDefault,
  cert,
  getApp,
  getApps,
  initializeApp,
  type ServiceAccount,
} from 'firebase-admin/app';
import {
  FIREBASE_ADMIN_APP,
  FIREBASE_MODULE_OPTIONS,
} from './firebase.constants';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirebaseFirestoreService } from './firebase-firestore.service';
import type { FirebaseModuleOptions } from './firebase-module-options';
import { FirebaseTodoRepository } from './firebase-todo.repository';

const defaultFirebaseOptionsProvider = {
  provide: FIREBASE_MODULE_OPTIONS,
  useFactory: (): FirebaseModuleOptions => ({
    appName: process.env.FIREBASE_APP_NAME,
    todosCollectionPath:
      process.env.FIREBASE_TODOS_COLLECTION ??
      process.env.FIRESTORE_TODOS_COLLECTION ??
      'todos',
    appOptions: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    },
  }),
};

const firebaseAdminAppProvider = {
  provide: FIREBASE_ADMIN_APP,
  inject: [FIREBASE_MODULE_OPTIONS],
  useFactory: (options: FirebaseModuleOptions): App => {
    const appName = options.appName;

    if (appName) {
      try {
        return getApp(appName);
      } catch (_error) {
        // App may not exist yet.
      }
    } else if (getApps().length > 0) {
      return getApps()[0];
    }

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const appOptions = {
      ...(options.appOptions ?? {}),
    };

    if (serviceAccountJson) {
      let serviceAccount: ServiceAccount;

      try {
        serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT_JSON: ${reason}`);
      }

      appOptions.credential = cert(serviceAccount);
    } else if (clientEmail || privateKey) {
      if (!clientEmail || !privateKey) {
        throw new Error(
          'FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must both be provided when using explicit Firebase credentials.',
        );
      }

      if (!projectId) {
        throw new Error(
          'FIREBASE_PROJECT_ID is required when using FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.',
        );
      }

      appOptions.credential = cert({
        clientEmail,
        projectId,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      });
    } else {
      appOptions.credential = appOptions.credential ?? applicationDefault();
    }

    return initializeApp(appOptions, appName);
  },
};

@Global()
@Module({
  providers: [
    defaultFirebaseOptionsProvider,
    firebaseAdminAppProvider,
    FirebaseAuthService,
    FirebaseFirestoreService,
    FirebaseTodoRepository,
    {
      provide: TODO_REPOSITORY,
      useExisting: FirebaseTodoRepository,
    },
  ],
  exports: [
    FIREBASE_MODULE_OPTIONS,
    FIREBASE_ADMIN_APP,
    FirebaseAuthService,
    FirebaseFirestoreService,
    FirebaseTodoRepository,
    TODO_REPOSITORY,
  ],
})
export class FirebaseModule {}
