import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async set(key: string, value: unknown, ttlInSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlInSeconds) {
      await this.redis.set(key, serialized, 'EX', ttlInSeconds);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async sadd(key: string, ...members: string[]): Promise<void> {
    await this.redis.sadd(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<void> {
    await this.redis.srem(key, ...members);
  }

  async scard(key: string): Promise<number> {
    return this.redis.scard(key);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.redis.sismember(key, member);
    return result === 1;
  }

  async smembers(key: string): Promise<string[]> {
    return this.redis.smembers(key);
  }
}
