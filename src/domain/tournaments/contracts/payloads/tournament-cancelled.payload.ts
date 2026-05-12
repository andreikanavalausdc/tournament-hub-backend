import { TournamentStatus } from '@src/domain/tournaments/enums/tournament-status.enum';

export interface TournamentCancelledPayload {
  tournamentId: string;
  status: TournamentStatus.CANCELLED;
  occurredAt: string;
}
