import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUserDto, RegisterUserResponseDto } from '@todos/core/http';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user with email and password.
   */
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
}
