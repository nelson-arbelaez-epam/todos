import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Register User DTO - for POST /auth/register requests
 */
export class RegisterUserDto {
  @IsEmail()
  @ApiProperty({
    description: 'The email address of the user to register',
    example: 'user@example.com',
  })
  email!: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({
    description: 'The password for the new user',
    example: 'strongPassword123',
  })
  password!: string;
}

/**
 * Register User Response DTO - safe response without sensitive credentials
 */
export class RegisterUserResponseDto {
  @ApiProperty({
    description: 'The unique identifier (UID) of the registered user',
    example: 'uid1234567890',
  })
  uid!: string;

  @ApiProperty({
    description: 'The email address of the registered user',
    example: 'user@example.com',
  })
  email!: string;
}
