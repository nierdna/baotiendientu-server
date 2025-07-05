import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { UserRepository } from '@/database/repositories/user.repository';
import { RegisterUserDto, LoginDto } from '@/api/dtos/user.dto';
import { UserEntity } from '@/database/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @Inject(UserRepository) private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto): Promise<UserEntity> {
    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      user_name: dto.user_name,
      email: dto.email,
      password: hashedPassword,
      avatar_url: dto.avatar_url,
      role: 'member',
    });

    return this.userRepo.save(user);
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(dto: LoginDto): Promise<{ access_token: string; user: UserEntity }> {
    const user = await this.validateUser(dto.email, dto.password);
    
    const payload = { sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return { access_token, user };
  }

  async verifyToken(token: string): Promise<UserEntity> {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.userRepo.findOne({ where: { id: decoded.sub } });
      if (!user) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
} 