import { Inject, Injectable } from '@nestjs/common';
import type { App } from 'firebase-admin/app';
import { type Auth, getAuth, type UserRecord } from 'firebase-admin/auth';
import { FIREBASE_ADMIN_APP } from './firebase.constants';

@Injectable()
export class FirebaseAuthService {
  private readonly authClient: Auth;

  constructor(@Inject(FIREBASE_ADMIN_APP) app: App) {
    this.authClient = getAuth(app);
  }

  /**
   * Verifies Firebase ID tokens and returns decoded claims.
   */
  async verifyIdToken(
    idToken: string,
    checkRevoked = false,
  ): Promise<Record<string, unknown>> {
    return this.authClient.verifyIdToken(idToken, checkRevoked);
  }

  /**
   * Returns a Firebase user by uid.
   */
  async getUser(uid: string): Promise<UserRecord> {
    return this.authClient.getUser(uid);
  }
}
