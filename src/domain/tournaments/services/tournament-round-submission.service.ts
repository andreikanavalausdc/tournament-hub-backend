import { BadRequestException, Injectable } from '@nestjs/common';
import { UpsertRoundSubmissionInput } from '@src/domain/tournaments/contracts/inputs/upsert-round-submission.input';
import { TournamentRoundEntity } from '@src/domain/tournaments/entities/tournament-round.entity';
import { TournamentRoundSubmissionEntity } from '@src/domain/tournaments/entities/tournament-round-submission.entity';
import { TournamentError } from '@src/domain/tournaments/enums/tournament-error.enum';
import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';

import { TournamentParticipantRepository } from '../repositories/tournament-participant.repository';
import { TournamentRoundSubmissionRepository } from '../repositories/tournament-round-submission.repository';
import { RoundSubmissionPhaseService } from './round-submission-phase.service';

@Injectable()
export class TournamentRoundSubmissionService {
  constructor(
    private readonly submissionRepository: TournamentRoundSubmissionRepository,
    private readonly participantRepository: TournamentParticipantRepository,
    private readonly roundSubmissionPhaseService: RoundSubmissionPhaseService,
  ) {}

  async upsert(input: UpsertRoundSubmissionInput): Promise<TournamentRoundSubmissionEntity> {
    const saved = await this.submissionRepository.manager.transaction(async (entityManager) => {
      const round = await entityManager.findOne(TournamentRoundEntity, {
        where: { id: input.roundId },
        lock: { mode: 'pessimistic_write' },
      });

      const isSubmissionDeadlineExpired = round ? round.submissionDeadline.getTime() <= Date.now() : false;

      if (
        !round ||
        round.phase !== TournamentRoundPhase.SUBMISSION ||
        round.submissionClosedAt ||
        isSubmissionDeadlineExpired
      ) {
        throw new BadRequestException(TournamentError.CANNOT_SUBMIT_OUTSIDE_SUBMISSION_PHASE);
      }

      const isParticipant = await this.participantRepository.exists({
        where: { tournamentId: round.tournamentId, userId: input.authorId },
      });

      if (!isParticipant) {
        throw new BadRequestException(TournamentError.SUBMISSION_AUTHOR_IS_NOT_PARTICIPANT);
      }

      const existing = await entityManager.findOne(TournamentRoundSubmissionEntity, {
        where: { roundId: input.roundId, authorId: input.authorId },
      });
      const submittedAt = new Date();

      if (existing) {
        existing.content = input.content;
        existing.submittedAt = submittedAt;

        return entityManager.save(TournamentRoundSubmissionEntity, existing);
      }

      const submission = entityManager.create(TournamentRoundSubmissionEntity, {
        roundId: input.roundId,
        authorId: input.authorId,
        content: input.content,
        submittedAt,
      });

      return entityManager.save(TournamentRoundSubmissionEntity, submission);
    });

    await this.roundSubmissionPhaseService.handleSubmissionSaved(input.roundId);

    return saved;
  }
}
