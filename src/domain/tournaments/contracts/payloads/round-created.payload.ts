import type { TournamentRoundPrompt } from '@src/domain/tournaments/contracts/interfaces/round-prompt.interface';
import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';

export interface TournamentRoundCreatedPayload {
  tournamentId: string;
  roundId: string;
  roundNumber: number;
  phase: TournamentRoundPhase.SUBMISSION;
  prompt: TournamentRoundPrompt;
  submissionDeadline: string;
  occurredAt: string;
}
