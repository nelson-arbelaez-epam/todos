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
    todosCollectionPath: process.env.FIRESTORE_TODOS_COLLECTION ?? 'todos',
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
    const appOptions = {
      ...(options.appOptions ?? {}),
    };

    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
      appOptions.credential = cert(serviceAccount);
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
