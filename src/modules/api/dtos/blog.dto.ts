import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { BlogEntity } from '@/database/entities/blog.entity';

export class CreateBlogDto {
  @ApiProperty({ description: 'Blog title', example: 'Understanding Blockchain', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'SEO slug', example: 'understanding-blockchain', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug: string;

  @ApiProperty({ description: 'Content (HTML or Markdown)' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Excerpt', maxLength: 1000 })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @ApiPropertyOptional({ description: 'Meta title', maxLength: 255 })
  @IsString()
  @IsOptional()
  meta_title?: string;

  @ApiPropertyOptional({ description: 'Meta description', maxLength: 255 })
  @IsString()
  @IsOptional()
  meta_description?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsUUID()
  @IsOptional()
  category_id?: string;
}

export class UpdateBlogDto {
  @ApiPropertyOptional({ description: 'Blog title', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ description: 'Content' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ description: 'Excerpt', maxLength: 1000 })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @ApiPropertyOptional({ description: 'Meta title', maxLength: 255 })
  @IsString()
  @IsOptional()
  meta_title?: string;

  @ApiPropertyOptional({ description: 'Meta description', maxLength: 255 })
  @IsString()
  @IsOptional()
  meta_description?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsUUID()
  @IsOptional()
  category_id?: string;

  @ApiPropertyOptional({ description: 'Publish status', example: true })
  @IsBoolean()
  @IsOptional()
  is_published?: boolean;

  @ApiPropertyOptional({ description: 'SEO slug', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  slug?: string;
}

export class BlogResponseDto {
  @ApiProperty({ description: 'Blog ID' })
  id: string;

  @ApiProperty({ description: 'Title' })
  title: string;

  @ApiProperty({ description: 'Slug' })
  slug: string;

  @ApiProperty({ description: 'Content' })
  content: string;

  @ApiPropertyOptional({ description: 'Excerpt' })
  excerpt?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  thumbnail_url?: string;

  @ApiPropertyOptional({ description: 'Meta title' })
  meta_title?: string;

  @ApiPropertyOptional({ description: 'Meta description' })
  meta_description?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  category_id?: string;

  @ApiProperty({ description: 'Author ID' })
  author_id: string;

  @ApiProperty({ description: 'Is published', example: false })
  is_published: boolean;

  @ApiProperty({ description: 'View count', example: 0 })
  view_count: number;

  @ApiProperty({ description: 'Like count', example: 0 })
  like_count: number;

  @ApiPropertyOptional({ description: 'Published at' })
  published_at?: Date;

  @ApiProperty({ description: 'Created at' })
  created_at: Date;

  @ApiProperty({ description: 'Updated at' })
  updated_at: Date;

  // Transform function to convert BlogEntity to BlogResponseDto
  static fromEntity(entity: BlogEntity): BlogResponseDto {
    return {
      id: entity.id,
      title: entity.title,
      slug: entity.slug,
      content: entity.content,
      excerpt: entity.excerpt,
      thumbnail_url: entity.thumbnail_url,
      meta_title: entity.meta_title,
      meta_description: entity.meta_description,
      category_id: entity.category?.id,
      author_id: entity.author?.id || null,
      is_published: entity.is_published,
      view_count: entity.view_count,
      like_count: entity.like_count,
      published_at: entity.published_at,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }
} 