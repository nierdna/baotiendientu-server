import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as path from 'path';

@Injectable()
export class MediaService {
  private readonly imgbbApiKey = '309bdd8d5ff4767d0d1092937476613b';
  private readonly imgbbApiUrl = 'https://api.imgbb.com/1/upload';

  constructor() {}

  async uploadToImgbb(file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('File không được để trống');
      }

      // Chuyển buffer sang base64 (KHÔNG prefix)
      const base64 = file.buffer.toString('base64');
      const formData = new URLSearchParams();
      formData.append('image', base64);

      // Upload to imgbb
      const response = await axios.post(
        `${this.imgbbApiUrl}?key=${this.imgbbApiKey}`,
        formData,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (response.data.success) {
        return {
          url: response.data.data.url,
          display_url: response.data.data.display_url,
          delete_url: response.data.data.delete_url,
          title: response.data.data.title,
          time: response.data.data.time
        };
      } else {
        throw new BadRequestException('Lỗi upload imgbb: ' + response.data.error?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Chi tiết lỗi imgbb:', error.response?.data || error.message);
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