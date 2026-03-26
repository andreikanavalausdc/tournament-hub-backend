import { Module } from '@nestjs/common';
import path from 'node:path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfig } from '@shared/config/typeorm.config';
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
