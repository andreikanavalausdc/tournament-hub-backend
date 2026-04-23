import { Injectable } from '@nestjs/common';
import { TournamentServerEvent } from '@src/domain/tournaments/contracts/events/tournament-server.event';
import { Server } from 'socket.io';

@Injectable()
export class TournamentSocketEmitterService {
  private server: Server | null = null;

  setServer(server: Server): void {
    this.server = server;
  }

  emit(tournamentId: string, event: TournamentServerEvent, payload: unknown): void {
    this.getServer().to(this.getRoom(tournamentId)).emit(event, payload);
  }

  async ejectFromRoom(userId: string, tournamentId: string): Promise<void> {
    const room = this.getRoom(tournamentId);
    const sockets = await this.getServer().in(room).fetchSockets();

    for (const socket of sockets) {
      if (socket.data?.user?.id === userId) {
        socket.leave(room);
      }
    }
  }

  private getServer(): Server {
    if (!this.server) {
      throw new Error('Socket server is not initialized');
    }

    return this.server;
  }

  private getRoom(tournamentId: string): string {
    return `tournament:${tournamentId}`;
  }
}

