import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FullTournamentRTO } from '@src/domain/tournaments/contracts/rto/full-tournament.rto';
import { TournamentEntity } from '@src/domain/tournaments/entities/tournament.entity';
import { TournamentParticipantEntity } from '@src/domain/tournaments/entities/tournament-participant.entity';
import { TournamentRoundEntity } from '@src/domain/tournaments/entities/tournament-round.entity';
import { TournamentError } from '@src/domain/tournaments/enums/tournament-error.enum';
import { IsNull } from 'typeorm';

import { TournamentRepository } from '../repositories/tournament.repository';
import { RoundPromptService } from './round-prompt.service';

@Injectable()
export class GetFullTournamentQueryService {
  constructor(
    private readonly tournamentRepository: TournamentRepository,
    private readonly roundPromptService: RoundPromptService,
  ) {}

  async execute(tournamentId: string, userId: string): Promise<FullTournamentRTO> {
    const entityManager = this.tournamentRepository.manager;
    const tournament = await entityManager.findOne(TournamentEntity, { where: { id: tournamentId } });

    if (!tournament) {
      throw new NotFoundException(`${this.tournamentRepository.metadata.tableName}.main.NOT_FOUND`);
    }

    const participants = await entityManager.find(TournamentParticipantEntity, {
      where: { tournamentId },
      order: { createdAt: 'ASC', userId: 'ASC' },
    });
    const isParticipant = participants.some((participant) => participant.userId === userId);

    if (!isParticipant) {
      throw new ForbiddenException(TournamentError.ONLY_PARTICIPANTS_CAN_VIEW_FULL_STATE);
    }

    const currentRound = await entityManager.findOne(TournamentRoundEntity, {
      where: { tournamentId, completedAt: IsNull() },
      order: { number: 'DESC' },
    });

    return {
      id: tournament.id,
      title: tournament.title,
      description: tournament.description,
      visibility: tournament.visibility,
      status: tournament.status,
      roundsCount: tournament.roundsCount,
      submissionDurationSeconds: tournament.submissionDurationSeconds,
      voteDurationSeconds: tournament.voteDurationSeconds,
      ownerId: tournament.ownerId,
      participants: participants.map((participant) => ({
        userId: participant.userId,
        cumulativeScore: participant.cumulativeScore,
      })),
      currentRound: currentRound
        ? {
            id: currentRound.id,
            number: currentRound.number,
            phase: currentRound.phase,
            prompt: this.roundPromptService.toPrompt(currentRound),
            submissionDeadline: currentRound.submissionDeadline.toISOString(),
            submissionClosedAt: currentRound.submissionClosedAt?.toISOString() ?? null,
            votingDeadline: currentRound.votingDeadline?.toISOString() ?? null,
          }
        : null,
    };
  }
}
