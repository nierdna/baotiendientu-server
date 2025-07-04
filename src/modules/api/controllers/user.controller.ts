import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RegisterUserDto, LoginDto, UserResponseDto } from '@/api/dtos/user.dto';
import { UserService } from '@/business/services/user.service';
import { ApiBaseResponse } from '@/shared/swagger/decorator/api-response.decorator';
import { BaseResponse } from '@/shared/swagger/response/base.response';
import { JwtAuthGuard } from '@/api/guards/jwt-auth.guard';
import { User } from '@/api/decorator/user.decorator';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBaseResponse(UserResponseDto)
  async register(@Body() dto: RegisterUserDto) {
    const user = await this.userService.register(dto);
    const { password, ...safeUser } = user;
    return new BaseResponse(safeUser);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and get access token' })
  @ApiBaseResponse()
  async login(@Body() dto: LoginDto) {
    const { access_token, user } = await this.userService.login(dto);
    const { password, ...safeUser } = user;
    return new BaseResponse({ access_token, user: safeUser });
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify token validity and get current user' })
  @ApiBaseResponse(UserResponseDto)
  async verifyToken(@User() user) {
    const { password, ...safeUser } = user;
    return new BaseResponse(safeUser);
  }
} 