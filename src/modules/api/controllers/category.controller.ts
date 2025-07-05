import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryService } from '@/business/services/category.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto } from '@/api/dtos/category.dto';
import { ApiBaseResponse } from '@/shared/swagger/decorator/api-response.decorator';
import { BaseResponse } from '@/shared/swagger/response/base.response';
import { JwtAuthGuard } from '@/api/guards/jwt-auth.guard';

@ApiTags('Category')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create category' })
  @ApiBearerAuth()
  @ApiBaseResponse(CategoryResponseDto)
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateCategoryDto) {
    const cat = await this.categoryService.create(dto);
    return new BaseResponse(cat);
  }

  @Get()
  @ApiOperation({ summary: 'List categories' })
  @ApiBaseResponse(CategoryResponseDto, { isArray: true })
  async findAll() {
    const cats = await this.categoryService.findAll();
    return new BaseResponse(cats);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category detail' })
  @ApiBaseResponse(CategoryResponseDto)
  async findOne(@Param('id') id: string) {
    const cat = await this.categoryService.findOne(id);
    return new BaseResponse(cat);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiBearerAuth()
  @ApiBaseResponse(CategoryResponseDto)
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const cat = await this.categoryService.update(id, dto);
    return new BaseResponse(cat);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  @ApiBearerAuth()
  @ApiBaseResponse()
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    await this.categoryService.remove(id);
    return new BaseResponse(null, 200, 'Deleted');
  }
} 