import { Module } from '@nestjs/common';
import { configDb } from './configs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Thread, Message } from './entities';
import { AdminConfigRepository, UserRepository, ThreadRepository, MessageRepository } from './repositories';
import { AdminConfigEntity } from './entities/admin-config.entity';
import { SeedDatabase } from './seeders/seed.database';

const repositories = [UserRepository, ThreadRepository, MessageRepository, AdminConfigRepository];

const services = [];

const entities = [User, Thread, Message, AdminConfigEntity];

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
