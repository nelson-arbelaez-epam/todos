import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { LoginUserDto, LoginUserResponseDto } from '@todos/core';

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

@Injectable()
export class FirebaseWebProxyService {
  private readonly logger = new Logger(FirebaseWebProxyService.name);

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
