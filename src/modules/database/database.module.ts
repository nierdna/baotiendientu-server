import { Module } from '@nestjs/common';
import { configDb } from './configs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/database/entities';
import { AdminConfigRepository, UserRepository } from './repositories';
import { AdminConfigEntity } from './entities/admin-config.entity';
import { SeedDatabase } from './seeders/seed.database';
import { TokenRepository } from './repositories/token.repository';
import { TokenEntity } from './entities/token.entity';
import { BirdeyeService } from '@/business/services/birdeye.service';
import { TokenService } from '@/business/services/token.service';

const repositories = [UserRepository, AdminConfigRepository, TokenRepository];

const services = [BirdeyeService, TokenService];

const entities = [UserEntity, AdminConfigEntity, TokenEntity];

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
