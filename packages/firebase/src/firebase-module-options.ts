import type { AppOptions } from 'firebase-admin/app';

export interface FirebaseModuleOptions {
  appName?: string;
  appOptions?: AppOptions;
  todosCollectionPath?: string;
  apiTokensCollectionPath?: string;
}
