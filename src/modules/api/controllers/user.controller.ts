import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RegisterUserDto, LoginDto, UserResponseDto } from '@/api/dtos/user.dto';
import { UserService } from '@/business/services/user.service';
import { ApiBaseResponse } from '@/shared/swagger/decorator/api-response.decorator';
import { BaseResponse } from '@/shared/swagger/response/base.response';

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
} 