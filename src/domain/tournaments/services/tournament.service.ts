import { randomUUID } from 'node:crypto';

import { BadRequestException, ConflictException, HttpException, Injectable } from '@nestjs/common';
import type { JoinTournamentInput } from '@src/domain/tournaments/contracts/inputs/join-tournament.input';
import { TournamentStatus } from '@src/domain/tournaments/enums/tournament-status.enum';
import { TournamentVisibility } from '@src/domain/tournaments/enums/tournament-visibility.enum';

import type { CreateTournamentInput } from '../contracts/inputs/create-tournament.input';
import { TournamentEntity } from '../entities/tournament.entity';
import { TournamentParticipantEntity } from '../entities/tournament-participant.entity';
import { TournamentError } from '../enums/tournament-error.enum';
import { TournamentEventsService } from './tournament-events.service';
import { TournamentRepository } from '../repositories/tournament.repository';
import { TournamentParticipantRepository } from '../repositories/tournament-participant.repository';

@Injectable()
export class TournamentService {
  constructor(
    private readonly repository: TournamentRepository,
    private readonly participantRepository: TournamentParticipantRepository,
    private readonly eventsService: TournamentEventsService,
  ) {}

  async create(input: CreateTournamentInput): Promise<TournamentEntity> {
    const { title, description, visibility, roundsCount, ownerId } = input;

    const hasUnfinishedParticipation = await this.participantRepository.hasUnfinishedParticipation(ownerId);

    if (hasUnfinishedParticipation) {
      throw new ConflictException(TournamentError.ALREADY_PARTICIPATING_IN_UNFINISHED_TOURNAMENT);
    }

    const inviteToken = visibility === TournamentVisibility.PRIVATE ? randomUUID() : null;

    const tournament = this.repository.create({
      title,
      description: description ?? null,
      visibility,
      roundsCount,
      status: TournamentStatus.DRAFT,
      inviteToken,
      ownerId,
    });

    try {
      return this.repository.manager.transaction(async (em) => {
        const saved = await em.save(TournamentEntity, tournament);

        await em.save(TournamentParticipantEntity, { tournamentId: saved.id, userId: ownerId });

        return saved;
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('[TournamentService.create] error:', error);
      throw new BadRequestException(TournamentError.CREATION_FAILED);
    }
  }

  async join(input: JoinTournamentInput): Promise<boolean> {
    const { tournamentId, userId, inviteToken } = input;

    const tournament = await this.repository.getOneById(tournamentId);

    if ([TournamentStatus.COMPLETED, TournamentStatus.CANCELLED].includes(tournament.status)) {
      throw new BadRequestException(TournamentError.CANNOT_JOIN_FINISHED_TOURNAMENT);
    }

    const isAlreadyParticipant = await this.participantRepository.exists({ where: { tournamentId, userId } });

    if (isAlreadyParticipant) {
      return true;
    }

    if (tournament.visibility === TournamentVisibility.PRIVATE) {
      if (!inviteToken) {
        throw new BadRequestException(TournamentError.PRIVATE_JOIN_REQUIRES_INVITE_TOKEN);
      }

      if (tournament.inviteToken !== inviteToken) {
        throw new BadRequestException(TournamentError.INVALID_INVITE_TOKEN);
      }
    }

    const hasUnfinishedParticipation = await this.participantRepository.hasUnfinishedParticipation(userId, tournamentId);

    if (hasUnfinishedParticipation) {
      throw new ConflictException(TournamentError.ALREADY_PARTICIPATING_IN_UNFINISHED_TOURNAMENT);
    }

    await this.participantRepository.save({ tournamentId, userId });

    this.eventsService.emitParticipantJoined(tournamentId, {
      tournamentId,
      userId,
      occurredAt: new Date().toISOString(),
    });

    return true;
  }
}
