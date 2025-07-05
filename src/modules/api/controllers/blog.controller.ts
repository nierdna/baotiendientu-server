import { Controller, Post, Get, Put, Delete, Param, Body, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from '@/business/services/blog.service';
import { CreateBlogDto, UpdateBlogDto, BlogResponseDto } from '@/api/dtos/blog.dto';
import { ApiBaseResponse } from '@/shared/swagger/decorator/api-response.decorator';
import { BaseResponse } from '@/shared/swagger/response/base.response';
import { CurrentUserId, CurrentUserRole } from '@/api/decorator/user.decorator';
import { JwtAuthGuard } from '@/api/guards/jwt-auth.guard';

@ApiTags('Blog')
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiOperation({ summary: 'Create blog post' })
  @ApiBearerAuth()
  @ApiBaseResponse(BlogResponseDto)
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreateBlogDto,
    @CurrentUserId() userId: string,
  ) {

    const blog = await this.blogService.create(userId, dto);
    return new BaseResponse(BlogResponseDto.fromEntity(blog));
  }

  @Get()
  @ApiOperation({ summary: 'List blog posts' })
  @ApiBaseResponse(BlogResponseDto, { isArray: true })
  async findAll() {
    const blogs = await this.blogService.findAll();
    const blogDtos = blogs.map(blog => BlogResponseDto.fromEntity(blog));
    return new BaseResponse(blogDtos);
  }



  @Get(':id')
  @ApiOperation({ summary: 'Get blog detail' })
  @ApiBaseResponse(BlogResponseDto)
  async findOne(@Param('id') id: string) {
    const blog = await this.blogService.findOne(id);
    return new BaseResponse(BlogResponseDto.fromEntity(blog));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update blog' })
  @ApiBearerAuth()
  @ApiBaseResponse(BlogResponseDto)
  @UseGuards(JwtAuthGuard)
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

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish blog' })
  @ApiBearerAuth()
  @ApiBaseResponse(BlogResponseDto)
  @UseGuards(JwtAuthGuard)
  async publish(
    @Param('id') id: string, 
    @CurrentUserId() userId: string,
    @CurrentUserRole() userRole: string,
  ) {
    const isAdmin = userRole === 'admin';
    const blog = await this.blogService.publish(id, userId, isAdmin);
    return new BaseResponse(BlogResponseDto.fromEntity(blog));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete blog' })
  @ApiBearerAuth()
  @ApiBaseResponse()
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string, 
    @CurrentUserId() userId: string,
    @CurrentUserRole() userRole: string,
  ) {
    const isAdmin = userRole === 'admin';
    await this.blogService.remove(id, userId, isAdmin);
    return new BaseResponse(null, 200, 'Deleted');
  }
} 