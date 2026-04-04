import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import { environment } from '@src/environment';

export const redisConfigFactory = (): RedisModuleOptions => {
  const url = environment.redis.url;

  if (url) {
    return {
      type: 'single',
      url,
    };
  }

  const host = environment.redis.host;
  const port = environment.redis.port;
  const password = environment.redis.password;

  return {
    type: 'single',
    options: {
      host,
      port,
      password,
    },
  };
};
