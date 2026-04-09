import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { config, parse } from 'dotenv';
import * as env from 'env-var';

config();

const loadEnv = process.env.NODE_ENV === 'test' ? parse(readFileSync(join(__dirname, '..', '.jest', '.env.test'))) : {};
Object.assign(process.env, loadEnv);

export const environment = {
  app: {
    nodeEnv: env.get('APP_NODE_ENV').asString(),
    port: env.get('APP_PORT').default('3001').asPortNumber(),
  },
  jwt: {
    secret: env.get('JWT_SECRET').required().asString(),
    expires: env.get('JWT_EXPIRES').required().asInt(),
    refreshExpires: env.get('JWT_REFRESH_EXPIRES').required().asInt(),
  },
  redis: {
    url: env.get('REDIS_URL').asString(),
    host: env.get('REDIS_HOST').asString(),
    port: env.get('REDIS_PORT').default('6379').asPortNumber(),
    password: env.get('REDIS_PASSWORD').asString(),
  },
  database: {
    url: env.get('DB_URL').asString(),
    host: env.get('DB_HOST').asString(),
    port: env.get('DB_PORT').default('5432').asPortNumber(),
    name: env.get('DB_DATABASE').asString(),
    username: env.get('DB_USERNAME').asString(),
    password: env.get('DB_PASSWORD').asString(),
  },
};
