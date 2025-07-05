import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, IsIn } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: "Source type", enum: ['blog', 'forum_thread'] })
  @IsString()
  @IsIn(['blog', 'forum_thread'])
  source_type: string;

  @ApiProperty({ description: 'Source ID (blog.id or forum_thread.id)' })
  @IsUUID()
  source_id: string;

  @ApiProperty({ description: 'Content', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({ description: 'Parent comment ID' })
  @IsUUID()
  @IsOptional()
  parent_id?: string;
}

export class UpdateCommentDto {
  @ApiProperty({ description: 'Updated content', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}

export class CommentResponseDto {
  @ApiProperty({ description: 'Comment ID' })
  id: string;

  @ApiProperty({ description: 'Source type' })
  source_type: string;

  @ApiProperty({ description: 'Source ID' })
  source_id: string;

  @ApiProperty({ description: 'User ID' })
  user_id: string;

  @ApiProperty({ description: 'Content' })
  content: string;

  @ApiPropertyOptional({ description: 'Parent ID' })
  parent_id?: string;

  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;
} 