export interface TournamentVoteProgressUpdatedPayload {
  tournamentId: string;
  roundId: string;
  submissionId: string;
  votedCount: number;
  totalEligibleActiveVoters: number;
  occurredAt: string;
}
