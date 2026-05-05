import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';

export interface TournamentRoundPhaseChangedPayload {
  tournamentId: string;
  roundId: string;
  roundNumber: number;
  previousPhase: TournamentRoundPhase.SUBMISSION;
  currentPhase: TournamentRoundPhase.VOTING;
  occurredAt: string;
}
