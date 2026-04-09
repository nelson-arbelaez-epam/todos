import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  LoginUserDto,
  LoginUserResponseDto,
  RegisterUserDto,
  RegisterUserResponseDto,
} from '@todos/core/http';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';

interface FirebaseError {
  code: string;
  message: string;
}

interface FirebaseRestSignInResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered: boolean;
}

interface FirebaseRestErrorResponse {
  error?: {
    message?: string;
  };
}

function isFirebaseError(err: unknown): err is FirebaseError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as FirebaseError).code === 'string'
  );
}

/**
 * Handles user authentication via Firebase Authentication.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  /**
   * Creates a new Firebase user with the provided email and password.
   * Returns a safe response containing only the uid and email.
   */
  async register(dto: RegisterUserDto): Promise<RegisterUserResponseDto> {
    try {
      const userRecord = await this.firebaseAdmin.auth.createUser({
        email: dto.email,
        password: dto.password,
      });

      this.logger.log(`User registered: ${userRecord.uid}`);

      return {
        uid: userRecord.uid,
        email: userRecord.email as string,
      };
    } catch (err: unknown) {
      if (isFirebaseError(err)) {
        if (err.code === 'auth/email-already-exists') {
          throw new ConflictException('Email is already registered');
        }
        if (
          err.code === 'auth/invalid-email' ||
          err.code === 'auth/weak-password' ||
          err.code === 'auth/invalid-password'
        ) {
          throw new BadRequestException(err.message);
        }
      }
      this.logger.error('Unexpected error during user registration', err);
      throw err;
    }
  }

  /**
   * Signs in a user with email and password via the Firebase Auth REST API.
   * Returns the Firebase ID token and relevant metadata.
   */
  async login(dto: LoginUserDto): Promise<LoginUserResponseDto> {
    const apiKey = process.env.FIREBASE_WEB_API_KEY;
    if (!apiKey) {
      this.logger.error('FIREBASE_WEB_API_KEY is not configured');
      throw new InternalServerErrorException(
        'Firebase Web API key is not configured',
      );
    }

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: dto.email,
          password: dto.password,
          returnSecureToken: true,
        }),
      });
    } catch (err: unknown) {
      this.logger.error('Network error calling Firebase Auth REST API', err);
      throw err;
    }

    if (!response.ok) {
      const errorBody = (await response.json()) as FirebaseRestErrorResponse;
      const errorCode = errorBody?.error?.message ?? '';
      this.logger.warn(`Firebase sign-in failed: ${errorCode}`);

      if (
        errorCode === 'EMAIL_NOT_FOUND' ||
        errorCode === 'INVALID_PASSWORD' ||
        errorCode === 'INVALID_LOGIN_CREDENTIALS' ||
        errorCode === 'USER_DISABLED'
      ) {
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.error('Unexpected Firebase Auth error:', errorBody);
      throw new UnauthorizedException('Authentication failed');
    }

    const data = (await response.json()) as FirebaseRestSignInResponse;
    this.logger.log(`User signed in: ${data.localId}`);

    return {
      idToken: data.idToken,
      email: data.email,
      expiresIn: data.expiresIn,
      uid: data.localId,
    };
  }
}
