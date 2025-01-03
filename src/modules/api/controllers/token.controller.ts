import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TokenService } from '@/business/services/token.service';
import { GetTokenDto } from '../dtos/token/get-token.dto';
import { GetTokensDto } from '../dtos/token/get-tokens.dto';
import { ApiBaseResponse } from '@/shared/swagger/decorator/api-response.decorator';
import { ResponseMessage } from '@/shared/decorators/response-message.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CacheTTL } from '@nestjs/cache-manager';
import { Throttle } from '@nestjs/throttler';
import { TokenInfo } from '@/shared/constants/token.interface';
import { TokenEntity } from '@/database/entities/token.entity';
@ApiTags('Token')
@Controller('api/v1/tokens')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get()
  @Throttle(60, 60)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  @ApiOperation({ summary: 'Lấy thông tin token theo mint address' })
  @ApiBaseResponse(TokenEntity, { 
    statusCode: 200,
    description: 'Lấy thông tin token thành công'
  })
  @ResponseMessage('Lấy thông tin token thành công')
  async getToken(@Query() getTokenDto: GetTokenDto): Promise<TokenInfo> {
    return this.tokenService.getTokenByAddress(getTokenDto.address);
  }

  @Get('batch')
  @Throttle(40, 60)
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  @ApiOperation({ summary: 'Lấy thông tin nhiều token theo danh sách mint address' })
  @ApiBaseResponse(TokenEntity, { 
    statusCode: 200,
    description: 'Lấy thông tin token thành công',
    isArray: true
  })
  @ResponseMessage('Lấy thông tin token thành công')
  async getTokens(@Query() getTokensDto: GetTokensDto): Promise<TokenInfo[]> {
    return this.tokenService.getTokensByAddresses(getTokensDto.addresses);
  }
} 