// import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserRepository } from '@/database/repositories';
import { Controller, Get, UseGuards, NotFoundException, HttpStatus } from '@nestjs/common';
// import { CurrentUser } from '@/shared/decorators/user.decorator';
// import { TJWTPayload } from '@/shared/types';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Get current user profile' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'User profile retrieved successfully',
  // })
  // @ApiResponse({
  //   status: HttpStatus.NOT_FOUND,
  //   description: 'User not found',
  // })
  // @ApiResponse({
  //   status: HttpStatus.UNAUTHORIZED,
  //   description: 'Unauthorized access',
  // })
  // async getUserProfile(@CurrentUser() userPayload: TJWTPayload) {
  //   try {
  //     const user = await this.userRepository.findOne({
  //       where: { id: userPayload.sub },
  //     });

  //     if (!user) {
  //       throw new NotFoundException({
  //         status_code: HttpStatus.NOT_FOUND,
  //         message: 'User not found',
  //       });
  //     }

  //     // Trả về thông tin người dùng, loại bỏ thông tin nhạy cảm
  //     return {
  //       id: user.id,
  //       username: user.username,
  //       address: user.address,
  //       created_at: user.created_at,
  //       updated_at: user.updated_at,
  //     };
  //   } catch (error) {
  //     console.log(`🔴 UserController getUserProfile error:`, error);
  //     throw error;
  //   }
  // }
} 