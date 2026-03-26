import { config, parse } from 'dotenv';
import * as env from 'env-var';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

config();

const loadEnv = process.env.NODE_ENV === 'test' ? parse(readFileSync(join(__dirname, '..', '.jest', '.env.test'))) : {};
Object.assign(process.env, loadEnv);

export const environment = {
  app: {
    nodeEnv: env.get('APP_NODE_ENV').asString(),
    port: env.get('APP_PORT').default('3001').asPortNumber(),
  },
  database: {
    host: env.get('DB_HOST').required().default('localhost').asString(),
    port: env.get('DB_PORT').required().default('5432').asPortNumber(),
    name: env.get('DB_DATABASE').required().asString(),
    username: env.get('DB_USERNAME').required().asString(),
    password: env.get('DB_PASSWORD').required().asString(),
  },
};
