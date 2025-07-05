import {
  Controller,
  Post,
  BadRequestException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import multer from 'multer';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { MediaService } from '@/business/services/media.service';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload file',
    description: 'Upload a file and return the public URL'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload'
        }
      },
      required: ['file']
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        status_code: { type: 'number', example: 200 },
        message: { type: 'string', example: 'File uploaded successfully' },
        data: {
          type: 'object',
          properties: {
            url: { 
              type: 'string', 
              example: 'https://i.ibb.co/abc123/image.jpg' 
            }
          }
        },
        timestamp: { type: 'string', example: '2025-07-05T10:00:00Z' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file or upload error'
  })
  async uploadFile(@Req() req: Request) {
    return new Promise((resolve, reject) => {
      const upload = multer({
        storage: multer.memoryStorage(),
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
        },
      }).single('file');

      upload(req, {} as any, async (err) => {
        if (err) {
          reject(new BadRequestException(`Lỗi upload: ${err.message}`));
          return;
        }

        const file = req.file;
        console.log('Controller received file:', {
          originalname: file?.originalname,
          mimetype: file?.mimetype,
          size: file?.size,
          bufferLength: file?.buffer?.length || 0
        });
        
        if (!file) {
          reject(new BadRequestException('File không được để trống'));
          return;
        }
        
        try {
          const result = await this.mediaService.uploadToImgbb(file);
          
          resolve({
            status_code: 200,
            message: 'File uploaded successfully',
            data: result,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          reject(new BadRequestException(error.message));
        }
      });
    });
  }
} 