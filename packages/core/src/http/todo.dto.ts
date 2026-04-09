import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

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

/**
 * Allowed fields for ordering todos
 */
export enum TodoOrderBy {
  CreatedAt = 'createdAt',
  UpdatedAt = 'updatedAt',
}

/**
 * Allowed sort directions
 */
export enum OrderDir {
  Asc = 'asc',
  Desc = 'desc',
}

/**
 * Query DTO for listing todos with pagination and ordering
 */
export class ListTodosQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    required: false,
    description: 'Page number (1-based)',
    default: 1,
    minimum: 1,
  })
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  @ApiProperty({
    required: false,
    description: 'Number of items per page',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  limit?: number = 20;

  @IsOptional()
  @IsEnum(TodoOrderBy)
  @ApiProperty({
    required: false,
    enum: TodoOrderBy,
    description: 'Field to order by',
    default: TodoOrderBy.CreatedAt,
  })
  orderBy?: TodoOrderBy = TodoOrderBy.CreatedAt;

  @IsOptional()
  @IsEnum(OrderDir)
  @ApiProperty({
    required: false,
    enum: OrderDir,
    description: 'Sort direction',
    default: OrderDir.Desc,
  })
  orderDir?: OrderDir = OrderDir.Desc;
}

/**
 * Paginated list response for todos
 */
export class TodoListDto {
  @ApiProperty({ type: [TodoDto], description: 'List of todos' })
  items!: TodoDto[];

  @ApiProperty({ description: 'Total number of matching todos' })
  total!: number;

  @ApiProperty({ description: 'Current page number' })
  page!: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit!: number;
}
