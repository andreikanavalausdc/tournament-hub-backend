import type { TournamentVoteValue } from '@src/domain/tournaments/enums/tournament-vote-value.enum';

export interface UpsertRoundVoteInput {
  roundId: string;
  submissionId: string;
  voterId: string;
  value: TournamentVoteValue;
}
