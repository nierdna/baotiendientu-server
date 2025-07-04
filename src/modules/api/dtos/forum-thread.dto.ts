import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsUUID, IsBoolean } from 'class-validator';

export class CreateForumThreadDto {
  @ApiProperty({ description: 'Forum ID the thread belongs to', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  forumId: string;

  @ApiProperty({ description: 'Title of the thread', example: 'Discussion about blockchain technologies', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Content of the thread', example: 'Let\'s discuss about ...' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateForumThreadDto {
  @ApiPropertyOptional({ description: 'Updated title of the thread', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'Updated content of the thread' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Lock/unlock thread', example: false })
  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;
}

export class ForumThreadResponseDto {
  @ApiProperty({ description: 'Thread ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Forum ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  forumId: string;

  @ApiProperty({ description: 'User ID of thread creator', example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ description: 'Thread title', example: 'Discussion about blockchain technologies' })
  title: string;

  @ApiProperty({ description: 'Thread content' })
  content: string;

  @ApiProperty({ description: 'View count', example: 0 })
  viewCount: number;

  @ApiProperty({ description: 'Like count', example: 0 })
  likeCount: number;

  @ApiProperty({ description: 'Is thread locked', example: false })
  isLocked: boolean;

  @ApiProperty({ description: 'Created timestamp', example: '2023-04-02T10:30:00Z' })
  created_at: Date;

  @ApiProperty({ description: 'Updated timestamp', example: '2023-04-02T10:30:00Z' })
  updated_at: Date;
} 