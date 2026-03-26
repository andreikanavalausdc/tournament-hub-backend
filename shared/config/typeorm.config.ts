import { CustomSnakeNamingStrategy } from '@shared/strategies/custom-snake-naming.strategy';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { environment } from '@src/environment';

config();

export class TypeormConfig implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      database: environment.database.name,
      host: environment.database.host,
      port: environment.database.port,
      username: environment.database.username,
      password: environment.database.password,
      synchronize: false,
      migrationsRun: false,
      retryAttempts: 10,
      retryDelay: 3000,
      entities: [`${__dirname}/../../**/entities/*.entity.{js,ts}`],
      migrationsTableName: 'migrations',
      migrations: [`${__dirname}/../migrations/**/*{.ts,.js}`],
      namingStrategy: new CustomSnakeNamingStrategy(),
      migrationsTransactionMode: 'each',
    };
  }
}
