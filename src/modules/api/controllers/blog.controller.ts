import { Controller, Post, Get, Put, Delete, Param, Body, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from '@/business/services/blog.service';
import { CreateBlogDto, UpdateBlogDto, BlogResponseDto } from '@/api/dtos/blog.dto';
import { ApiBaseResponse } from '@/shared/swagger/decorator/api-response.decorator';
import { BaseResponse } from '@/shared/swagger/response/base.response';
import { CurrentUserId } from '@/api/decorator/user.decorator';

@ApiTags('Blog')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiOperation({ summary: 'Create blog post' })
  @ApiBearerAuth()
  @ApiBaseResponse(BlogResponseDto)
  async create(
    @Body() dto: CreateBlogDto,
    @CurrentUserId() userId: string,
  ) {
    const blog = await this.blogService.create(userId, dto);
    return new BaseResponse(blog);
  }

  @Get()
  @ApiOperation({ summary: 'List blog posts' })
  @ApiBaseResponse(BlogResponseDto, { isArray: true })
  async findAll() {
    const blogs = await this.blogService.findAll();
    return new BaseResponse(blogs);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blog detail' })
  @ApiBaseResponse(BlogResponseDto)
  async findOne(@Param('id') id: string) {
    const blog = await this.blogService.findOne(id);
    return new BaseResponse(blog);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update blog' })
  @ApiBearerAuth()
  @ApiBaseResponse(BlogResponseDto)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @CurrentUserId() userId: string,
  ) {
    const blog = await this.blogService.update(id, userId, dto);
    return new BaseResponse(blog);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish blog' })
  @ApiBearerAuth()
  @ApiBaseResponse(BlogResponseDto)
  async publish(@Param('id') id: string, @CurrentUserId() userId: string) {
    const blog = await this.blogService.publish(id, userId);
    return new BaseResponse(blog);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete blog' })
  @ApiBearerAuth()
  @ApiBaseResponse()
  async remove(@Param('id') id: string, @CurrentUserId() userId: string) {
    await this.blogService.remove(id, userId);
    return new BaseResponse(null, 200, 'Deleted');
  }
} 