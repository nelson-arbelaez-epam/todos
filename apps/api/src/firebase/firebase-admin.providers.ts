import {
  type App,
  type AppOptions,
  applicationDefault,
  cert,
  getApp,
  getApps,
  initializeApp,
  type ServiceAccount,
} from 'firebase-admin/app';
import { type Firestore, getFirestore } from 'firebase-admin/firestore';

export const FIREBASE_APP = 'FIREBASE_APP';
export const FIRESTORE = 'FIRESTORE';

function parseServiceAccountJson(rawValue: string): ServiceAccount {
  const parsed = JSON.parse(rawValue) as ServiceAccount;

  if (parsed.privateKey) {
    parsed.privateKey = parsed.privateKey.replace(/\\n/g, '\n');
  }

  return parsed;
}

function buildFirebaseAppOptions(): AppOptions {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (serviceAccountJson) {
    const serviceAccount = parseServiceAccountJson(serviceAccountJson);
    return {
      credential: cert(serviceAccount),
      projectId: projectId ?? serviceAccount.projectId,
    };
  }

  if (projectId && clientEmail && privateKey) {
    return {
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    };
  }

  return projectId
    ? {
        credential: applicationDefault(),
        projectId,
      }
    : {
        credential: applicationDefault(),
      };
}

function getOrCreateFirebaseApp(): App {
  const appName = 'todos-api';

  if (getApps().some((app) => app.name === appName)) {
    return getApp(appName);
  }

  return initializeApp(buildFirebaseAppOptions(), appName);
}

export const firebaseAdminProviders = [
  {
    provide: FIREBASE_APP,
    useFactory: getOrCreateFirebaseApp,
  },
  {
    provide: FIRESTORE,
    inject: [FIREBASE_APP],
    useFactory: (app: App): Firestore => getFirestore(app),
  },
];
