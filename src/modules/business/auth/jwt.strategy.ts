import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../database/repositories/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'super_secret_key',
    });
  }

  async validate(payload: any) {
    // payload.sub là id của user từ token
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    // Loại bỏ các thông tin nhạy cảm
    if (user) {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        address: user.address,
      };
    }

    return null;
  }
} 