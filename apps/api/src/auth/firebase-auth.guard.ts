import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';

export interface AuthenticatedRequest extends Request {
  user: { uid: string };
}

/**
 * Guard that verifies a Firebase ID token from the Authorization header.
 * Attaches `{ uid }` to `request.user` on success.
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.substring(7);

    try {
      const decoded = await this.firebaseAdmin.auth.verifyIdToken(token);
      (request as AuthenticatedRequest).user = { uid: decoded.uid };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired Firebase ID token');
    }
  }
}
