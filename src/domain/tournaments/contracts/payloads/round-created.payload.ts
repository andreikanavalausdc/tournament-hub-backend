import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';

export interface TournamentRoundCreatedPayload {
  tournamentId: string;
  roundId: string;
  roundNumber: number;
  phase: TournamentRoundPhase.SUBMISSION;
  submissionDeadline: string;
  occurredAt: string;
}
