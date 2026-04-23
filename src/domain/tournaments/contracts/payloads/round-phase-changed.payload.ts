import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';

export interface TournamentRoundPhaseChangedPayload {
  tournamentId: string;
  roundId: string;
  phase: TournamentRoundPhase.VOTING;
  occurredAt: string;
}
