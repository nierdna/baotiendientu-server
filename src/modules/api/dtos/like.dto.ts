import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ToggleLikeDto {
  @ApiProperty({ description: 'Source type', enum: ['blog', 'forum_thread'] })
  @IsString()
  @IsIn(['blog', 'forum_thread'])
  sourceType: string;

  @ApiProperty({ description: 'Source ID' })
  @IsUUID()
  sourceId: string;
} 