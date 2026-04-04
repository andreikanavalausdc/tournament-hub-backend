import { Module } from '@nestjs/common';
import { RedisModule as IORedisModule } from '@nestjs-modules/ioredis';

import { redisConfigFactory } from './configs/redis.config';
import { RedisService } from './services/redis.service';

@Module({
  imports: [
    IORedisModule.forRootAsync({
      useFactory: redisConfigFactory,
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
