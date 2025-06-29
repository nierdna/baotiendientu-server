import { Module } from '@nestjs/common';
import { configDb } from './configs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminConfigRepository, ArticleRepository, ProcessedArticleRepository } from './repositories';
import { AdminConfigEntity, ArticleEntity, ProcessedArticleEntity } from './entities';
import { SeedDatabase } from './seeders/seed.database';

const repositories = [AdminConfigRepository, ArticleRepository, ProcessedArticleRepository];

const services = [];

const entities = [AdminConfigEntity, ArticleEntity, ProcessedArticleEntity];

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
