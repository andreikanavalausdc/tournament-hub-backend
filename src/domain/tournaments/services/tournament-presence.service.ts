import { Injectable } from '@nestjs/common';
import { RedisService } from '@src/modules/redis/services/redis.service';

interface TournamentPresenceMutationResult {
  activeCount: number;
}

@Injectable()
export class TournamentPresenceService {
  constructor(private readonly redisService: RedisService) {}

  async add(tournamentId: string, userId: string, socketId: string): Promise<TournamentPresenceMutationResult> {
    await this.redisService.sadd(this.socketsKey(tournamentId, userId), socketId);
    await this.redisService.sadd(this.usersKey(tournamentId), userId);
    await this.redisService.sadd(this.socketTournamentsKey(socketId), tournamentId);

    return {
      activeCount: await this.getCount(tournamentId),
    };
  }

  async remove(tournamentId: string, userId: string, socketId: string): Promise<TournamentPresenceMutationResult> {
    const socketsKey = this.socketsKey(tournamentId, userId);

    await this.redisService.srem(socketsKey, socketId);
    await this.redisService.srem(this.socketTournamentsKey(socketId), tournamentId);

    const remaining = await this.redisService.scard(socketsKey);

    if (remaining === 0) {
      await this.redisService.delete(socketsKey);
      await this.redisService.srem(this.usersKey(tournamentId), userId);
    }

    const socketTournamentsKey = this.socketTournamentsKey(socketId);
    const remainingTournaments = await this.redisService.scard(socketTournamentsKey);

    if (remainingTournaments === 0) {
      await this.redisService.delete(socketTournamentsKey);
    }

    return {
      activeCount: await this.getCount(tournamentId),
    };
  }

  async getCount(tournamentId: string): Promise<number> {
    return this.redisService.scard(this.usersKey(tournamentId));
  }

  async isOnline(tournamentId: string, userId: string): Promise<boolean> {
    return this.redisService.sismember(this.usersKey(tournamentId), userId);
  }

  async removeSocketFromAllTournaments(socketId: string, userId: string): Promise<TournamentPresenceMutationResultByTournament[]> {
    const tournaments = await this.redisService.smembers(this.socketTournamentsKey(socketId));
    const uniqueTournaments = [...new Set(tournaments)];
    const results: TournamentPresenceMutationResultByTournament[] = [];

    for (const tournamentId of uniqueTournaments) {
      const mutation = await this.remove(tournamentId, userId, socketId);
      results.push({
        tournamentId,
        activeCount: mutation.activeCount,
      });
    }

    await this.redisService.delete(this.socketTournamentsKey(socketId));

    return results;
  }

  private socketsKey(tournamentId: string, userId: string): string {
    return `presence:${tournamentId}:sockets:${userId}`;
  }

  private usersKey(tournamentId: string): string {
    return `presence:${tournamentId}:users`;
  }

  private socketTournamentsKey(socketId: string): string {
    return `presence:socket:${socketId}:tournaments`;
  }
}

interface TournamentPresenceMutationResultByTournament {
  tournamentId: string;
  activeCount: number;
}
