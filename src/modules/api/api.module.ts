import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { DatabaseModule } from '@/database';
import { HealthController, ForumThreadController, UserController, BlogController, CategoryController, TagController, CommentController, LikeController, MediaController, TestUploadController } from '@/api/controllers';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { QueueModule } from '@/queue/queue.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { redisStore } from 'cache-manager-redis-store';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { configAuth } from './configs/auth';
import { configCache } from './configs/cache';
import { HttpCacheInterceptor } from './interceptors';
import { BusinessModule } from '@/business/business.module';

const controllers = [HealthController, ForumThreadController, UserController, BlogController, CategoryController, TagController, CommentController, LikeController, MediaController, TestUploadController];

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: process.env.APP_ENV === 'production' ? 60 : 600,
    }),
    DatabaseModule,
    QueueModule,
    BusinessModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let urlRedis = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DATABASE}?family=${process.env.REDIS_FAMILY}`;
        if (process.env.REDIS_PASSWORD) {
          urlRedis = `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DATABASE}?family=${process.env.REDIS_FAMILY}`;
        }
        return {
          ttl: configService.get('cache.api.cache_ttl'),
          store: (await redisStore({
            url: urlRedis,
            ttl: Number(configService.get('cache.api.cache_ttl')) / 1000,
          })) as unknown as CacheStore,
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configAuth, configCache],
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwt.jwt_secret_key'),
        global: true,
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10000,
    }),
  ],
  controllers: [...controllers],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
    // ...services,
  ],
  exports: [],
})
export class ApiModule implements OnApplicationBootstrap {
  constructor() {}

  async onApplicationBootstrap() {}
}
