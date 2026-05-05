import { TournamentStatus } from '@src/domain/tournaments/enums/tournament-status.enum';

export interface TournamentStartedPayload {
  tournamentId: string;
  status: TournamentStatus.ACTIVE;
  roundsCount: number;
  occurredAt: string;
}
