import { Inject, Injectable } from '@nestjs/common';
import type { LoginUserDto, LoginUserResponseDto } from '@todos/core';
import type { App } from 'firebase-admin/app';
import {
  type Auth,
  type CreateRequest,
  type DecodedIdToken,
  getAuth,
  type UserRecord,
} from 'firebase-admin/auth';
import { FIREBASE_ADMIN_APP } from './firebase.constants';
import { FirebaseWebProxyService } from './firebase-web-proxy.service';

@Injectable()
export class FirebaseAuthService {
  private readonly authClient: Auth;

  constructor(
    @Inject(FIREBASE_ADMIN_APP) app: App,
    private readonly firebaseWebProxy: FirebaseWebProxyService,
  ) {
    this.authClient = getAuth(app);
  }

  /**
   * Creates a new Firebase user with the provided properties.
   */
  async createUser(properties: CreateRequest): Promise<UserRecord> {
    return this.authClient.createUser(properties);
  }

  /**
   * Signs in a user through the Firebase Identity Toolkit REST API.
   */
  async login(dto: LoginUserDto): Promise<LoginUserResponseDto> {
    return this.firebaseWebProxy.login(dto);
  }

  /**
   * Verifies Firebase ID tokens and returns decoded claims.
   */
  async verifyIdToken(
    idToken: string,
    checkRevoked = false,
  ): Promise<DecodedIdToken> {
    return this.authClient.verifyIdToken(idToken, checkRevoked);
  }

  /**
   * Returns a Firebase user by uid.
   */
  async getUser(uid: string): Promise<UserRecord> {
    return this.authClient.getUser(uid);
  }
}
