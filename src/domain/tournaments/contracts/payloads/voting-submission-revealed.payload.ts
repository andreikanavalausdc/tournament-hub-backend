export interface TournamentVotingSubmissionRevealedPayload {
  tournamentId: string;
  roundId: string;
  submission: {
    id: string;
    authorId: string;
    content: string;
    submittedAt: string;
  };
  revealIndex: number;
  totalSubmissions: number;
  votingDeadline: string;
  occurredAt: string;
}
