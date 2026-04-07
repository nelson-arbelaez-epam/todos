import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

/**
 * Service wrapping the Firebase Admin SDK, initialised once on module startup.
 * Credentials are resolved from GOOGLE_APPLICATION_CREDENTIALS or ADC.
 */
@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app!: admin.app.App;

  onModuleInit(): void {
    if (admin.apps.length === 0) {
      this.app = admin.initializeApp();
      this.logger.log('Firebase Admin SDK initialised');
    } else {
      this.app = admin.app();
      this.logger.log('Firebase Admin SDK reused existing app');
    }
  }

  get auth(): admin.auth.Auth {
    return this.app.auth();
  }
}
