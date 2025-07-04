import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: 'Tag name', example: 'DeFi', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'SEO slug', example: 'defi', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug: string;
}

export class UpdateTagDto {
  @ApiPropertyOptional({ description: 'Tag name', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'SEO slug', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  slug?: string;
}

export class TagResponseDto {
  @ApiProperty({ description: 'Tag ID' })
  id: string;

  @ApiProperty({ description: 'Name' })
  name: string;

  @ApiProperty({ description: 'Slug' })
  slug: string;

  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;
} 