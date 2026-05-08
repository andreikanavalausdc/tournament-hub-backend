import { Injectable } from '@nestjs/common';
import {
  RoundResult,
  RoundVoteAggregate,
} from '@src/domain/tournaments/contracts/interfaces/round-result.interface';
import { TournamentRoundSubmissionEntity } from '@src/domain/tournaments/entities/tournament-round-submission.entity';

@Injectable()
export class RoundResultCalculatorService {
  calculate(
    submissions: TournamentRoundSubmissionEntity[],
    voteAggregates: RoundVoteAggregate[],
  ): RoundResult[] {
    const aggregatesBySubmissionId = new Map(
      voteAggregates.map((aggregate) => [aggregate.submissionId, aggregate]),
    );

    return submissions
      .map((submission) => {
        const aggregate = aggregatesBySubmissionId.get(submission.id);
        const likeCount = aggregate?.likeCount ?? 0;
        const dislikeCount = aggregate?.dislikeCount ?? 0;

        return {
          submissionId: submission.id,
          authorId: submission.authorId,
          likeCount,
          dislikeCount,
          roundScore: likeCount,
        };
      })
      .sort((left, right) => {
        if (right.roundScore !== left.roundScore) {
          return right.roundScore - left.roundScore;
        }

        if (right.likeCount !== left.likeCount) {
          return right.likeCount - left.likeCount;
        }

        return left.submissionId.localeCompare(right.submissionId);
      });
  }
}
