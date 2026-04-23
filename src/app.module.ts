import path from 'node:path';

import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfig } from '@shared/config/typeorm.config';
import { AppController } from '@src/app.controller';
import { AuthModule } from '@src/domain/auth/auth.module';
import { TournamentsModule } from '@src/domain/tournaments/tournaments.module';
import { UsersModule } from '@src/domain/users/users.module';
import { environment } from '@src/environment';
import { FingerprintModule } from '@src/modules/fingerprint/fingerprint.module';
import { RedisModule } from '@src/modules/redis/redis.module';
import { CookieResolver, I18nModule, QueryResolver } from 'nestjs-i18n';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useClass: TypeormConfig }),
    BullModule.forRoot({
      connection: environment.redis.url
        ? { url: environment.redis.url }
        : {
            host: environment.redis.host,
            port: environment.redis.port,
            password: environment.redis.password,
          },
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'ru',
      fallbacks: {
        'en-*': 'ru',
      },
      loaderOptions: {
        path: path.join(__dirname, '/../i18n/'),
        includeSubfolders: true,
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }, new CookieResolver(['i18n'])],
    }),
    AuthModule,
    UsersModule,
    TournamentsModule,
    RedisModule,
    FingerprintModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
