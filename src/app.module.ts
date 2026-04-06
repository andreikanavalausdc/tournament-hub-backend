import path from 'node:path';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfig } from '@shared/config/typeorm.config';
import { AuthModule } from '@src/domain/auth/auth.module';
import { TournamentsModule } from '@src/domain/tournaments/tournaments.module';
import { UsersModule } from '@src/domain/users/users.module';
import { FingerprintModule } from '@src/modules/fingerprint/fingerprint.module';
import { RedisModule } from '@src/modules/redis/redis.module';
import { CookieResolver, I18nModule, QueryResolver } from 'nestjs-i18n';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useClass: TypeormConfig }),
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
  controllers: [],
  providers: [],
})
export class AppModule {}
