import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TagService } from '@/business/services/tag.service';
import { CreateTagDto, UpdateTagDto, TagResponseDto } from '@/api/dtos/tag.dto';
import { ApiBaseResponse } from '@/shared/swagger/decorator/api-response.decorator';
import { BaseResponse } from '@/shared/swagger/response/base.response';
import { JwtAuthGuard } from '@/api/guards/jwt-auth.guard';

@ApiTags('Tag')
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @ApiOperation({ summary: 'Create tag' })
  @ApiBearerAuth()
  @ApiBaseResponse(TagResponseDto)
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateTagDto) {
    const tag = await this.tagService.create(dto);
    return new BaseResponse(tag);
  }

  @Get()
  @ApiOperation({ summary: 'List tags' })
  @ApiBaseResponse(TagResponseDto, { isArray: true })
  async findAll() {
    const tags = await this.tagService.findAll();
    return new BaseResponse(tags);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag detail' })
  @ApiBaseResponse(TagResponseDto)
  async findOne(@Param('id') id: string) {
    const tag = await this.tagService.findOne(id);
    return new BaseResponse(tag);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tag' })
  @ApiBearerAuth()
  @ApiBaseResponse(TagResponseDto)
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    const tag = await this.tagService.update(id, dto);
    return new BaseResponse(tag);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tag' })
  @ApiBearerAuth()
  @ApiBaseResponse()
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    await this.tagService.remove(id);
    return new BaseResponse(null, 200, 'Deleted');
  }
} 