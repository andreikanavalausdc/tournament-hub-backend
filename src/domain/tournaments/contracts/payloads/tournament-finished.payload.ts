import { TournamentStatus } from '@src/domain/tournaments/enums/tournament-status.enum';

export interface TournamentFinishedPayload {
  tournamentId: string;
  status: TournamentStatus.COMPLETED;
  overallWinnerId: string | null;
  finalLeaderboard: {
    userId: string;
    cumulativeScore: number;
    rank: number;
  }[];
  occurredAt: string;
}
