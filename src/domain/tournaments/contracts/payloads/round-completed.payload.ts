export interface TournamentRoundCompletedPayload {
  tournamentId: string;
  roundId: string;
  roundNumber: number;
  rankings: {
    submissionId: string;
    authorId: string;
    likeCount: number;
    dislikeCount: number;
    score: number;
  }[];
  leaderboard: {
    userId: string;
    cumulativeScore: number;
    rank: number;
  }[];
  nextRoundNumber: number | null;
  isLastRound: boolean;
  occurredAt: string;
}
