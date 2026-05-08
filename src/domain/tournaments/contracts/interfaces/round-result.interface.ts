export interface RoundVoteAggregate {
  submissionId: string;
  likeCount: number;
  dislikeCount: number;
}

export interface RoundResult {
  submissionId: string;
  authorId: string;
  likeCount: number;
  dislikeCount: number;
  roundScore: number;
}
