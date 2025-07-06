import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength, IsArray } from 'class-validator';
import { BlogEntity } from '@/database/entities/blog.entity';

export class CreateBlogDto {
  @ApiProperty({ description: 'Blog title', example: 'Understanding Blockchain', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ 
    description: 'SEO slug (auto-generated from title if not provided)', 
    example: 'understanding-blockchain', 
    maxLength: 255 
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  slug?: string;

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

  @ApiPropertyOptional({ 
    description: 'Array of tag IDs or tag names', 
    example: ['tag-1', 'tag-2'] 
  })
  @IsArray()
  @IsOptional()
  tags?: string[];
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

  @ApiPropertyOptional({ 
    description: 'Array of tag IDs or tag names', 
    example: ['tag-1', 'tag-2'] 
  })
  @IsArray()
  @IsOptional()
  tags?: string[];
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

  @ApiPropertyOptional({ 
    description: 'Category information',
    example: {
      id: 'category-uuid',
      name: 'Cryptocurrency',
      slug: 'cryptocurrency',
      description: 'Articles about cryptocurrency'
    }
  })
  category?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };

  @ApiProperty({ 
    description: 'Author information',
    example: {
      id: 'author-uuid',
      email: 'author@example.com',
      first_name: 'John',
      last_name: 'Doe',
      avatar_url: 'https://example.com/avatar.jpg'
    }
  })
  author: {
    id: string;
    email: string;
    user_name: string;
    avatar_url?: string;
    role: string;
  };

  @ApiProperty({ description: 'Is published', example: false })
  is_published: boolean;

  @ApiProperty({ description: 'View count', example: 0 })
  view_count: number;

  @ApiProperty({ description: 'Like count', example: 0 })
  like_count: number;

  @ApiPropertyOptional({ description: 'Published at', example: '2025-07-05T10:30:00Z' })
  published_at?: string;

  @ApiProperty({ description: 'Created at', example: '2025-07-05T10:00:00Z' })
  created_at: string;

  @ApiProperty({ description: 'Updated at', example: '2025-07-05T10:30:00Z' })
  updated_at: string;

  @ApiPropertyOptional({ 
    description: 'Array of tags associated with this blog',
    example: [
      { id: 'tag-1', name: 'blockchain', slug: 'blockchain' },
      { id: 'tag-2', name: 'crypto', slug: 'crypto' }
    ]
  })
  tags?: Array<{ id: string; name: string; slug: string }>;

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
      category: entity.category ? {
        id: entity.category.id,
        name: entity.category.name,
        slug: entity.category.slug,
        description: entity.category.description,
      } : undefined,
      author: entity.author ? {
        id: entity.author.id,
        email: entity.author.email,
        user_name: entity.author.user_name,
        avatar_url: entity.author.avatar_url,
        role: entity.author.role,
      } : undefined,
      is_published: entity.is_published,
      view_count: entity.view_count,
      like_count: entity.like_count,
      published_at: entity.published_at?.toISOString(),
      created_at: entity.created_at?.toISOString(),
      updated_at: entity.updated_at?.toISOString(),
      tags: entity.tags?.map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug
      })) || [],
    };
  }
} 