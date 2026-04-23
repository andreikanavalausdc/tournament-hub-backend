import { Injectable } from '@nestjs/common';
import { RedisService } from '@src/modules/redis/services/redis.service';

@Injectable()
export class TournamentPresenceService {
  constructor(private readonly redisService: RedisService) {}

  async add(tournamentId: string, userId: string, socketId: string): Promise<void> {
    await this.redisService.sadd(this.socketsKey(tournamentId, userId), socketId);
    await this.redisService.sadd(this.usersKey(tournamentId), userId);
  }

  async remove(tournamentId: string, userId: string, socketId: string): Promise<void> {
    const socketsKey = this.socketsKey(tournamentId, userId);

    await this.redisService.srem(socketsKey, socketId);

    const remaining = await this.redisService.scard(socketsKey);

    if (remaining === 0) {
      await this.redisService.delete(socketsKey);
      await this.redisService.srem(this.usersKey(tournamentId), userId);
    }
  }

  async getCount(tournamentId: string): Promise<number> {
    return this.redisService.scard(this.usersKey(tournamentId));
  }

  async isOnline(tournamentId: string, userId: string): Promise<boolean> {
    return this.redisService.sismember(this.usersKey(tournamentId), userId);
  }

  private socketsKey(tournamentId: string, userId: string): string {
    return `presence:${tournamentId}:sockets:${userId}`;
  }

  private usersKey(tournamentId: string): string {
    return `presence:${tournamentId}:users`;
  }
}
