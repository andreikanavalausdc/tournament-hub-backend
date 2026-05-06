import { BadRequestException, Injectable } from '@nestjs/common';
import { UpsertRoundVoteInput } from '@src/domain/tournaments/contracts/inputs/upsert-round-vote.input';
import { TournamentParticipantEntity } from '@src/domain/tournaments/entities/tournament-participant.entity';
import { TournamentRoundEntity } from '@src/domain/tournaments/entities/tournament-round.entity';
import { TournamentRoundSubmissionEntity } from '@src/domain/tournaments/entities/tournament-round-submission.entity';
import { TournamentRoundVoteEntity } from '@src/domain/tournaments/entities/tournament-round-vote.entity';
import { TournamentError } from '@src/domain/tournaments/enums/tournament-error.enum';
import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';
import { TournamentRoundVotingStepStatus } from '@src/domain/tournaments/enums/tournament-round-voting-step-status.enum';
import { TournamentVoteSource } from '@src/domain/tournaments/enums/tournament-vote-source.enum';

import { TournamentRoundVoteRepository } from '../repositories/tournament-round-vote.repository';
import { RoundVotingFlowService } from './round-voting-flow.service';

@Injectable()
export class TournamentRoundVoteService {
  constructor(
    private readonly voteRepository: TournamentRoundVoteRepository,
    private readonly roundVotingFlowService: RoundVotingFlowService,
  ) {}

  async upsertManualVote(input: UpsertRoundVoteInput): Promise<TournamentRoundVoteEntity> {
    const saved = await this.voteRepository.manager.transaction(async (entityManager) => {
      const round = await entityManager.findOne(TournamentRoundEntity, {
        where: { id: input.roundId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!round || round.phase !== TournamentRoundPhase.VOTING) {
        throw new BadRequestException(TournamentError.CANNOT_VOTE_OUTSIDE_VOTING_PHASE);
      }

      if (
        round.votingStepStatus !== TournamentRoundVotingStepStatus.OPEN ||
        !round.currentVotingSubmissionId ||
        !round.votingDeadline
      ) {
        throw new BadRequestException(TournamentError.NO_ACTIVE_VOTING_SUBMISSION);
      }

      if (round.currentVotingSubmissionId !== input.submissionId) {
        throw new BadRequestException(TournamentError.VOTE_TARGET_IS_NOT_CURRENT_SUBMISSION);
      }

      if (round.votingDeadline.getTime() <= Date.now()) {
        throw new BadRequestException(TournamentError.VOTING_WINDOW_EXPIRED);
      }

      const submission = await entityManager.findOneByOrFail(TournamentRoundSubmissionEntity, {
        id: input.submissionId,
      });

      if (submission.authorId === input.voterId) {
        throw new BadRequestException(TournamentError.CANNOT_VOTE_FOR_OWN_SUBMISSION);
      }

      const isParticipant = await entityManager.exists(TournamentParticipantEntity, {
        where: { tournamentId: round.tournamentId, userId: input.voterId },
      });

      if (!isParticipant) {
        throw new BadRequestException(TournamentError.VOTER_IS_NOT_PARTICIPANT);
      }

      const votedAt = new Date();
      const existing = await entityManager.findOne(TournamentRoundVoteEntity, {
        where: {
          roundId: input.roundId,
          submissionId: input.submissionId,
          voterId: input.voterId,
        },
      });

      if (existing) {
        existing.value = input.value;
        existing.source = TournamentVoteSource.MANUAL;
        existing.votedAt = votedAt;

        return entityManager.save(TournamentRoundVoteEntity, existing);
      }

      const vote = entityManager.create(TournamentRoundVoteEntity, {
        roundId: input.roundId,
        submissionId: input.submissionId,
        voterId: input.voterId,
        value: input.value,
        source: TournamentVoteSource.MANUAL,
        votedAt,
      });

      return entityManager.save(TournamentRoundVoteEntity, vote);
    });

    await this.roundVotingFlowService.handleManualVoteSaved(input.roundId);

    return saved;
  }
}
