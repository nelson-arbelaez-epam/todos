import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiTokenResponseDto,
  CreateApiTokenDto,
  LoginUserDto,
  LoginUserResponseDto,
  RegisterUserDto,
  RegisterUserResponseDto,
} from '@todos/core/http';
import { ApiTokenService } from './api-token.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import type { AuthenticatedPrincipal } from './firebase-auth.guard';
import { Public } from './public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly apiTokenService: ApiTokenService,
  ) {}

  /**
   * Register a new user with email and password.
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: RegisterUserDto })
  @ApiOperation({ summary: 'Register a new user with email/password' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: RegisterUserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input (email format or weak password)',
  })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(
    @Body() dto: RegisterUserDto,
  ): Promise<RegisterUserResponseDto> {
    return this.authService.register(dto);
  }

  /**
   * Authenticate a user with email and password, returning a Firebase ID token.
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginUserDto })
  @ApiOperation({
    summary: 'Sign in with email/password and receive a Firebase ID token',
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful – returns Firebase ID token',
    type: LoginUserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request payload',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() dto: LoginUserDto): Promise<LoginUserResponseDto> {
    return this.authService.login(dto);
  }

  /**
   * Issue a new long-lived API token for the authenticated user.
   * The raw token value is returned exactly once in the response body.
   */
  @ApiBearerAuth('firebase-jwt')
  @Post('tokens')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateApiTokenDto })
  @ApiOperation({
    summary: 'Issue a new long-lived API token (requires Firebase JWT)',
  })
  @ApiResponse({
    status: 201,
    description:
      'Token issued successfully. The raw token is returned once – store it securely.',
    type: ApiTokenResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request payload (missing label, invalid scopes, etc.)',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid Firebase JWT',
  })
  async createToken(
    @CurrentUser() user: AuthenticatedPrincipal,
    @Body() dto: CreateApiTokenDto,
  ): Promise<ApiTokenResponseDto> {
    return this.apiTokenService.createToken(user.uid, dto);
  }
}
