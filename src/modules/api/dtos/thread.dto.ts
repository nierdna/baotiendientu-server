import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateThreadDto {
  @ApiPropertyOptional({
    description: 'The title of the thread',
    example: 'Discussion about blockchain technologies',
    maxLength: 100
  })
  title: string;
}

export class ThreadResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the thread',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'The title of the thread',
    example: 'Discussion about blockchain technologies'
  })
  title: string;

  @ApiProperty({
    description: 'User ID who created the thread',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  user_id: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-04-02T10:30:00Z'
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-04-02T10:30:00Z'
  })
  updated_at: Date;
} 