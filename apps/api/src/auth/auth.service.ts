import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import type {
  LoginUserDto,
  LoginUserResponseDto,
  RegisterUserDto,
  RegisterUserResponseDto,
} from '@todos/core/http';
import { FirebaseAuthService } from '@todos/firebase';

interface FirebaseError {
  code: string;
  message: string;
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

  constructor(private readonly firebaseAuth: FirebaseAuthService) {}

  /**
   * Creates a new Firebase user with the provided email and password.
   * Returns a safe response containing only the uid and email.
   */
  async register(dto: RegisterUserDto): Promise<RegisterUserResponseDto> {
    try {
      const userRecord = await this.firebaseAuth.createUser({
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
    return this.firebaseAuth.login(dto);
  }
}
