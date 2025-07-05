import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from '@/business/services/blog.service';
import { CreateBlogDto, UpdateBlogDto, BlogResponseDto } from '@/api/dtos/blog.dto';
import { BaseResponse } from '@/shared/swagger/response/base.response';
import { CurrentUserId, CurrentUserRole } from '@/api/decorator/user.decorator';
import { JwtAuthGuard } from '@/api/guards/jwt-auth.guard';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({
    status: 201,
    description: 'Blog created successfully',
    type: BlogResponseDto,
  })
  async create(
    @Body() dto: CreateBlogDto,
    @CurrentUserId() userId: string,
  ) {
    const blog = await this.blogService.create(userId, dto);
    return new BaseResponse(BlogResponseDto.fromEntity(blog));
  }

  @Get()
  @ApiOperation({ summary: 'Get all blog posts' })
  @ApiResponse({
    status: 200,
    description: 'Blogs retrieved successfully',
    type: [BlogResponseDto],
  })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    const result = await this.blogService.findAll(page, limit);
    const blogDtos = result.blogs.map(blog => BlogResponseDto.fromEntity(blog));
    return new BaseResponse(blogDtos, 200, 'Blogs retrieved successfully', {
      current_page: Number(page),
      take: Number(limit),
      total: result.total,
      total_pages: Math.ceil(result.total / limit),
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a blog post by ID' })
  @ApiResponse({
    status: 200,
    description: 'Blog retrieved successfully',
    type: BlogResponseDto,
  })
  async findOne(@Param('id') id: string) {
    const blog = await this.blogService.findOne(id);
    return new BaseResponse(BlogResponseDto.fromEntity(blog));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a blog post' })
  @ApiResponse({
    status: 200,
    description: 'Blog updated successfully',
    type: BlogResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @CurrentUserId() userId: string,
    @CurrentUserRole() userRole: string,
  ) {
    const isAdmin = userRole === 'admin';
    const blog = await this.blogService.update(id, userId, dto, isAdmin);
    return new BaseResponse(BlogResponseDto.fromEntity(blog));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a blog post' })
  @ApiResponse({
    status: 200,
    description: 'Blog deleted successfully',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
    @CurrentUserRole() userRole: string,
  ) {
    const isAdmin = userRole === 'admin';
    await this.blogService.remove(id, userId, isAdmin);
    return new BaseResponse(null, 200, 'Blog deleted successfully');
  }

  @Put(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a blog post' })
  @ApiResponse({
    status: 200,
    description: 'Blog published successfully',
    type: BlogResponseDto,
  })
  async publish(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
    @CurrentUserRole() userRole: string,
  ) {
    const isAdmin = userRole === 'admin';
    const blog = await this.blogService.publish(id, userId, isAdmin);
    return new BaseResponse(BlogResponseDto.fromEntity(blog));
  }
} 