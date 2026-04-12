import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiTokenMetadataDto,
  ApiTokenResponseDto,
  CreateApiTokenDto,
  LoginUserDto,
  LoginUserResponseDto,
  RegisterUserDto,
  RegisterUserResponseDto,
  RevokeApiTokenResponseDto,
} from '@todos/core/http';
import { CurrentUser } from '../../shared/http/decorators/current-user.decorator';
import { Public } from '../../shared/http/decorators/public.decorator';
import type { AuthenticatedPrincipal } from '../../shared/http/guards/firebase-auth.guard';
import { ApiTokenService } from '../api-token.service';
import { AuthService } from '../auth.service';

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
   * Per ADR 0022, only Firebase JWT authentication is permitted (to prevent token proliferation).
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
  @ApiResponse({
    status: 403,
    description:
      'API tokens cannot issue other API tokens (requires Firebase JWT)',
  })
  async createToken(
    @CurrentUser() user: AuthenticatedPrincipal,
    @Body() dto: CreateApiTokenDto,
  ): Promise<ApiTokenResponseDto> {
    return this.apiTokenService.createToken(user.uid, dto);
  }

  /**
   * List all API tokens for the authenticated user.
   * The raw token value and its hash are never included in the response.
   * Only Firebase JWT callers may access this endpoint; API tokens are rejected
   * at the guard level (no @AuthScope declared — see ADR 0022).
   */
  @ApiBearerAuth('firebase-jwt')
  @Get('tokens')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      "List caller's issued API tokens (metadata only, requires Firebase JWT)",
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns metadata for all tokens owned by the authenticated user. Raw token values are never included.',
    type: ApiTokenMetadataDto,
    isArray: true,
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid authentication',
  })
  @ApiResponse({
    status: 403,
    description:
      'API tokens cannot access this endpoint (requires Firebase JWT)',
  })
  async listTokens(
    @CurrentUser() user: AuthenticatedPrincipal,
  ): Promise<ApiTokenMetadataDto[]> {
    return this.apiTokenService.listTokens(user.uid);
  }

  /**
   * Revoke an existing API token by its tokenId.
   * The operation is idempotent – revoking an already-revoked token succeeds.
   * Per ADR 0022, only Firebase JWT authentication is permitted.
   */
  @ApiBearerAuth('firebase-jwt')
  @Delete('tokens/:tokenId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'tokenId',
    description: 'UUID of the token to revoke',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiOperation({
    summary: 'Revoke an existing API token (requires Firebase JWT)',
  })
  @ApiResponse({
    status: 200,
    description: 'Token revoked successfully',
    type: RevokeApiTokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid bearer token' })
  @ApiResponse({
    status: 403,
    description:
      'API tokens cannot revoke other API tokens (requires Firebase JWT)',
  })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async revokeToken(
    @CurrentUser() user: AuthenticatedPrincipal,
    @Param('tokenId') tokenId: string,
  ): Promise<RevokeApiTokenResponseDto> {
    // Enforce ADR 0022: only Firebase JWT can revoke tokens, not API tokens
    if ('authProvider' in user && user.authProvider === 'api-token') {
      throw new ForbiddenException(
        'Token revocation requires Firebase JWT authentication',
      );
    }
    return this.apiTokenService.revokeToken(user.uid, tokenId);
  }
}
