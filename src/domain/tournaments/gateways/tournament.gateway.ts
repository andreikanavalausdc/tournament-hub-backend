import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { WsExceptionFilter } from '@shared/filters/ws-exception.filter';
import { JwtUserPayload } from '@shared/interfaces/jwt-user-payload.interface';
import { WsValidationPipe } from '@shared/pipes/ws-validation.pipe';
import { JoinTournamentAck } from '@src/domain/tournaments/contracts/acks/join-tournament.ack';
import { LeaveTournamentAck } from '@src/domain/tournaments/contracts/acks/leave-tournament.ack';
import { JoinTournamentDTO } from '@src/domain/tournaments/contracts/dto/join-tournament.dto';
import { LeaveTournamentDTO } from '@src/domain/tournaments/contracts/dto/leave-tournament.dto';
import { TournamentClientEvent } from '@src/domain/tournaments/contracts/events/tournament-client.event';
import { Server, Socket } from 'socket.io';

import { WsJwtGuard } from '../guards/ws-jwt.guard';
import { TournamentEventsService } from '../services/tournament-events.service';
import { TournamentPresenceService } from '../services/tournament-presence.service';
import { TournamentRoomAccessService } from '../services/tournament-room-access.service';
import { TournamentSocketEmitterService } from '../services/tournament-socket-emitter.service';
import { WsJwtAuthService } from '../services/ws-jwt-auth.service';

@UsePipes(new WsValidationPipe())
@UseFilters(new WsExceptionFilter())
@WebSocketGateway({ cors: { origin: '*' } })
export class TournamentGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly wsJwtAuthService: WsJwtAuthService,
    private readonly presenceService: TournamentPresenceService,
    private readonly roomAccessService: TournamentRoomAccessService,
    private readonly socketEmitterService: TournamentSocketEmitterService,
    private readonly eventsService: TournamentEventsService,
  ) {}

  afterInit(server: Server): void {
    this.socketEmitterService.setServer(server);
  }

  async handleConnection(client: Socket): Promise<void> {
    const user = await this.wsJwtAuthService.authenticate(client);

    if (!user) {
      client.disconnect();
      return;
    }

    client.data.user = user;
    client.data.joinedTournaments = [];
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const user: JwtUserPayload | undefined = client.data?.user;

    if (!user) {
      return;
    }

    const joinedTournaments: string[] = client.data.joinedTournaments ?? [];

    for (const tournamentId of joinedTournaments) {
      await this.presenceService.remove(tournamentId, user.id, client.id);

      this.eventsService.emitPresenceUpdated(tournamentId, {
        tournamentId,
        activeCount: await this.presenceService.getCount(tournamentId),
        occurredAt: new Date().toISOString(),
      });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage(TournamentClientEvent.JOIN)
  async onJoin(@ConnectedSocket() client: Socket, @MessageBody() dto: JoinTournamentDTO): Promise<JoinTournamentAck> {
    const { tournamentId } = dto;
    const user: JwtUserPayload = client.data.user;

    const access = await this.roomAccessService.canJoin(user.id, tournamentId);

    if (!access.allowed) {
      throw new WsException(access.reason ?? 'Unable to join tournament room');
    }

    client.join(`tournament:${tournamentId}`);
    client.data.joinedTournaments.push(tournamentId);
    await this.presenceService.add(tournamentId, user.id, client.id);

    this.eventsService.emitPresenceUpdated(tournamentId, {
      tournamentId,
      activeCount: await this.presenceService.getCount(tournamentId),
      occurredAt: new Date().toISOString(),
    });

    return { success: true };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage(TournamentClientEvent.LEAVE)
  async onLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: LeaveTournamentDTO,
  ): Promise<LeaveTournamentAck> {
    const { tournamentId } = dto;
    const user: JwtUserPayload = client.data.user;

    client.leave(`tournament:${tournamentId}`);

    client.data.joinedTournaments = client.data.joinedTournaments.filter((id: string) => id !== tournamentId);

    await this.presenceService.remove(tournamentId, user.id, client.id);

    this.eventsService.emitPresenceUpdated(tournamentId, {
      tournamentId,
      activeCount: await this.presenceService.getCount(tournamentId),
      occurredAt: new Date().toISOString(),
    });

    return { success: true };
  }
}
