import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('test-upload')
export class TestUploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    console.log('File:', {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
      bufferLength: file?.buffer?.length,
    });
    if (!file || !file.buffer) throw new BadRequestException('File buffer lỗi hoặc rỗng');
    return {
      message: 'Upload thành công',
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      bufferLength: file.buffer.length,
    };
  }
} 