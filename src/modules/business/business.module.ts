import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { OpenAIService } from './services/openai.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ForumThreadService } from './services/forum-thread.service';
import { UserService } from './services/user.service';
import { JwtModule } from '@nestjs/jwt';
import { BlogService } from './services/blog.service';
import { CategoryService } from './services/category.service';
import { TagService } from './services/tag.service';
import { CommentService } from './services/comment.service';
import { LikeService } from './services/like.service';
import { MediaService } from './services/media.service';

const services = [OpenAIService, ForumThreadService, UserService, BlogService, CategoryService, TagService, CommentService, LikeService, MediaService];

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwt.jwt_secret_key'),
        global: true,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [...services],
  providers: [...services],
})
export class BusinessModule {}
