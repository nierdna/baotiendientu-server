import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as path from 'path';

@Injectable()
export class MediaService {
  private readonly imgbbApiKey: string;
  private readonly imgbbApiUrl: string;

  constructor() {
    this.imgbbApiKey = process.env.IMGBB_API_KEY || '309bdd8d5ff4767d0d1092937476613b';
    this.imgbbApiUrl = process.env.IMGBB_API_URL || 'https://api.imgbb.com/1/upload';
  }

  async uploadToImgbb(file: Express.Multer.File) {
    try {
      if (!file) throw new BadRequestException('File không được để trống');
      
      // Debug: Log file object để xem có gì
      console.log('File object:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer ? `Buffer(${file.buffer.length})` : 'null',
        filename: file.filename
      });

      // Chuyển buffer sang base64 (memory storage)
      const base64 = file.buffer.toString('base64');
      
      if (!base64 || base64.length < 100) throw new BadRequestException('File buffer lỗi hoặc rỗng');

      // Gửi base64 qua form-data
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('image', base64);

      const response = await axios.post(
        `${this.imgbbApiUrl}?key=${this.imgbbApiKey}`,
        formData,
        { headers: formData.getHeaders() }
      );
      if (response.data.success) {
        return {
          url: response.data.data.url,
          display_url: response.data.data.display_url,
        };
      } else {
        throw new BadRequestException('Lỗi upload imgbb: ' + response.data.error?.message || 'Unknown error');
      }
    } catch (error) {
      throw new BadRequestException(`Lỗi upload file: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async listFiles(prefix?: string) {
    // Imgbb không hỗ trợ list files qua API
    // Trả về thông báo không hỗ trợ
    throw new BadRequestException('Tính năng list files không được hỗ trợ với imgbb');
  }

  async deleteFile(fileKey: string) {
    // Imgbb không hỗ trợ delete files qua API
    // Trả về thông báo không hỗ trợ
    throw new BadRequestException('Tính năng delete files không được hỗ trợ với imgbb');
  }
} 