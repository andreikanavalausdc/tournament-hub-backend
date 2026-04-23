export interface TournamentVoteFinalizedPayload {
  tournamentId: string;
  roundId: string;
  submissionId: string;
  likeCount: number;
  dislikeCount: number;
  occurredAt: string;
}
