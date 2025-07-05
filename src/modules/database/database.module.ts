import { Module } from '@nestjs/common';
import { configDb } from './configs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminConfigRepository, UserRepository, CategoryRepository, TagRepository, BlogRepository, ForumRepository, ForumThreadRepository, CommentRepository, LikeRepository } from './repositories';
import { AdminConfigEntity, UserEntity, CategoryEntity, TagEntity, BlogEntity, ForumEntity, ForumThreadEntity, CommentEntity, LikeEntity } from './entities';
import { SeedDatabase } from './seeders/seed.database';

const repositories = [
  AdminConfigRepository,
  UserRepository,
  CategoryRepository,
  TagRepository,
  BlogRepository,
  ForumRepository,
  ForumThreadRepository,
  CommentRepository,
  LikeRepository,
];

const services = [];

const entities = [
  AdminConfigEntity,
  UserEntity,
  CategoryEntity,
  TagEntity,
  BlogEntity,
  ForumEntity,
  ForumThreadEntity,
  CommentEntity,
  LikeEntity,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('db'),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature(entities),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configDb],
    }),
  ],
  controllers: [],
  providers: [...repositories, ...services, SeedDatabase],
  exports: [...repositories, ...services],
})
export class DatabaseModule {}
