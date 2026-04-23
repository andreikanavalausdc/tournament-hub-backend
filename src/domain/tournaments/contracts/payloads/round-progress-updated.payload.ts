import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';

export interface TournamentRoundProgressUpdatedPayload {
  tournamentId: string;
  roundId: string;
  phase: TournamentRoundPhase.SUBMISSION;
  submittedCount: number;
  totalActiveParticipants: number;
  occurredAt: string;
}
