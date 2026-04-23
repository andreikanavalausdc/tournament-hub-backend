import { TournamentServerEvent } from '@src/domain/tournaments/contracts/events/tournament-server.event';
import { TournamentEventPayload } from '@src/domain/tournaments/contracts/jobs/tournament-event-payload.job';

export const TOURNAMENTS_QUEUE_NAME = 'tournaments';

export enum TournamentJobName {
  BROADCAST_EVENT = 'broadcast-event',
  EJECT_FROM_ROOM = 'eject-from-room',
}

export interface BroadcastEventJobData {
  tournamentId: string;
  event: TournamentServerEvent;
  payload: TournamentEventPayload;
}

export type BroadcastEventJobResult = void;

export interface EjectFromRoomJobData {
  userId: string;
  tournamentId: string;
}

export type EjectFromRoomJobResult = void;

export type TournamentJobData = BroadcastEventJobData | EjectFromRoomJobData;

export type TournamentJobResult = BroadcastEventJobResult | EjectFromRoomJobResult;

export type TournamentJob = `${TournamentJobName}`;

