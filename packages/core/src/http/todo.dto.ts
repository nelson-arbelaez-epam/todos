import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * Create Todo DTO - for POST requests
 */
export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @ApiProperty()
  title!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  description?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value ?? false)
  @ApiProperty({ required: false })
  completed?: boolean;
}

/**
 * Update Todo DTO - for PUT/PATCH requests
 */
export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @ApiProperty({ required: false })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  description?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  completed?: boolean;
}

/**
 * Todo Response DTO - for HTTP responses
 */
export class TodoDto {
  @IsString()
  @ApiProperty({ description: 'Unique identifier of the todo' })
  id!: string;

  @IsString()
  @ApiProperty({ description: 'Title of the todo' })
  title!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Optional description' })
  description?: string;

  @IsBoolean()
  @ApiProperty({ description: 'Whether the todo is completed' })
  completed!: boolean;

  @IsOptional()
  @Type(() => Date)
  @ApiProperty({
    required: false,
    description: 'Timestamp when the todo was archived',
  })
  archivedAt?: Date;

  @Type(() => Date)
  @ApiProperty({ description: 'Timestamp when the todo was created' })
  createdAt!: Date;

  @Type(() => Date)
  @ApiProperty({ description: 'Timestamp when the todo was last updated' })
  updatedAt!: Date;
}
