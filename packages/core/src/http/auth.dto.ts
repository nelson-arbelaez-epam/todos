import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Register User DTO - for POST /auth/register requests
 */
export class RegisterUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

/**
 * Register User Response DTO - safe response without sensitive credentials
 */
export class RegisterUserResponseDto {
  uid!: string;

  email!: string;
}
