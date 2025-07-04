import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { UserRepository } from '@/database/repositories';
import { RegisterUserDto, LoginDto } from '@/api/dtos/user.dto';
import { UserEntity } from '@/database/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @Inject(UserRepository) private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async register(dto: RegisterUserDto): Promise<UserEntity> {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException('Email already registered');
    }
    const user = this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: this.hashPassword(dto.password),
      avatarUrl: dto.avatarUrl,
      role: 'member',
    });
    return this.userRepo.save(user);
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    if (user.password !== this.hashPassword(password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(dto: LoginDto): Promise<{ access_token: string; user: UserEntity }> {
    const user = await this.validateUser(dto.email, dto.password);
    const payload = { sub: user.id, role: user.role };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('auth.jwt.jwt_secret_key'),
      expiresIn: this.configService.get<number>('auth.jwt.access_token_lifetime'),
    });
    return { access_token: token, user };
  }
} 