import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  LoginUserDto,
  LoginUserResponseDto,
  RegisterUserDto,
  RegisterUserResponseDto,
} from '@todos/core/http';
import { Public } from '@todos/shared';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
