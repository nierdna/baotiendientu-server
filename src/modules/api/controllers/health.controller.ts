import { UserRepository } from '@/database/repositories';
import { ResponseMessage } from '@/shared/decorators/response-message.decorator';
import { ApiBaseResponse } from '@/shared/swagger/decorator/api-response.decorator';
import {
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FormatResponseInterceptor } from '../interceptors';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private userRepository: UserRepository) {}

  funErr() {
    console.log('Test error ');
    try {
      throw new Error('Test error');
    } catch (e) {
      throw e;
    }
  }

  @Get('')
  @ResponseMessage('Hello')
  @ApiOperation({ summary: 'Basic health check endpoint' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'API is healthy',
  })
  async healthCheck() {
    return 1;
  }

  @Get('check-db')
  @ApiOperation({ summary: 'Check database connection' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Database connection is healthy',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Database connection failed',
  })
  async checkDB() {
    return await this.userRepository.findOne({ where: {} });
  }

  @Get('throw')
  @ApiOperation({ summary: 'Testing error handling' })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'This endpoint always throws an error',
  })
  throwError() {
    this.funErr();
  }
}
