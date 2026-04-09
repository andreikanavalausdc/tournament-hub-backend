import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { CustomSnakeNamingStrategy } from '@shared/strategies/custom-snake-naming.strategy';
import { environment } from '@src/environment';
import { config } from 'dotenv';

config();

export class TypeormConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    const baseConfig: TypeOrmModuleOptions = {
      type: 'postgres',
      synchronize: false,
      migrationsRun: false,
      retryAttempts: 10,
      retryDelay: 3000,
      entities: [`${__dirname}/../../**/entities/*.entity.{js,ts}`],
      migrationsTableName: 'migrations',
      migrations: [`${__dirname}/../migrations/**/*{.ts,.js}`],
      namingStrategy: new CustomSnakeNamingStrategy(),
      migrationsTransactionMode: 'each',
      ssl: {
        rejectUnauthorized: false,
      },
    };

    if (environment.database.url) {
      return {
        ...baseConfig,
        url: environment.database.url,
      };
    }

    return {
      ...baseConfig,
      host: environment.database.host,
      port: environment.database.port,
      username: environment.database.username,
      password: environment.database.password,
      database: environment.database.name,
    };
  }
}
