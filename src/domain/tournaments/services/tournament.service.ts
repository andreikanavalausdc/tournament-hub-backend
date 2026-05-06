import { randomUUID } from 'node:crypto';

import { BadRequestException, ConflictException, ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import type { JoinTournamentInput } from '@src/domain/tournaments/contracts/inputs/join-tournament.input';
import { TournamentRoundEntity } from '@src/domain/tournaments/entities/tournament-round.entity';
import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';
import { TournamentStatus } from '@src/domain/tournaments/enums/tournament-status.enum';
import { TournamentVisibility } from '@src/domain/tournaments/enums/tournament-visibility.enum';

import type { CreateTournamentInput } from '../contracts/inputs/create-tournament.input';
import { TournamentEntity } from '../entities/tournament.entity';
import { TournamentParticipantEntity } from '../entities/tournament-participant.entity';
import { TournamentError } from '../enums/tournament-error.enum';
import { TournamentRepository } from '../repositories/tournament.repository';
import { TournamentParticipantRepository } from '../repositories/tournament-participant.repository';
import { RoundSubmissionPhaseService } from './round-submission-phase.service';
import { TournamentEventsService } from './tournament-events.service';

@Injectable()
export class TournamentService {
  private readonly minimumParticipantsToStart = 4;

  constructor(
    private readonly repository: TournamentRepository,
    private readonly participantRepository: TournamentParticipantRepository,
    private readonly eventsService: TournamentEventsService,
    private readonly roundSubmissionPhaseService: RoundSubmissionPhaseService,
  ) {}

  async create(input: CreateTournamentInput): Promise<TournamentEntity> {
    const { title, description, visibility, roundsCount, submissionDurationSeconds, voteDurationSeconds, ownerId } =
      input;

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
      submissionDurationSeconds,
      voteDurationSeconds,
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

  async start(tournamentId: string, userId: string): Promise<TournamentRoundEntity> {
    const started = await this.repository.manager.transaction(async (em) => {
      const tournament = await em.findOne(TournamentEntity, {
        where: { id: tournamentId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!tournament) {
        throw new BadRequestException(`${this.repository.metadata.tableName}.main.NOT_FOUND`);
      }

      if (tournament.ownerId !== userId) {
        throw new ForbiddenException(TournamentError.ONLY_OWNER_CAN_START_TOURNAMENT);
      }

      if (tournament.status !== TournamentStatus.DRAFT) {
        throw new BadRequestException(TournamentError.TOURNAMENT_ALREADY_STARTED);
      }

      const participantCount = await em.count(TournamentParticipantEntity, {
        where: { tournamentId },
      });

      if (participantCount < this.minimumParticipantsToStart) {
        throw new BadRequestException(TournamentError.NOT_ENOUGH_PARTICIPANTS_TO_START);
      }

      const submissionDeadline = new Date(Date.now() + tournament.submissionDurationSeconds * 1000);

      tournament.status = TournamentStatus.ACTIVE;
      await em.save(TournamentEntity, tournament);

      const round = em.create(TournamentRoundEntity, {
        tournamentId,
        number: 1,
        phase: TournamentRoundPhase.SUBMISSION,
        submissionDeadline,
        submissionClosedAt: null,
        currentVotingSubmissionId: null,
        currentRevealIndex: null,
        votingDeadline: null,
        votingCompletedAt: null,
      });

      const savedRound = await em.save(TournamentRoundEntity, round);

      return { tournament, round: savedRound };
    });

    this.roundSubmissionPhaseService.scheduleSubmissionDeadline(started.round);
    this.eventsService.emitTournamentStarted(tournamentId, {
      tournamentId,
      status: TournamentStatus.ACTIVE,
      roundsCount: started.tournament.roundsCount,
      occurredAt: new Date().toISOString(),
    });
    this.eventsService.emitRoundCreated(tournamentId, {
      tournamentId,
      roundId: started.round.id,
      roundNumber: started.round.number,
      phase: TournamentRoundPhase.SUBMISSION,
      submissionDeadline: started.round.submissionDeadline.toISOString(),
      occurredAt: new Date().toISOString(),
    });

    return started.round;
  }

  async leave(tournamentId: string, userId: string): Promise<boolean> {
    const tournament = await this.repository.getOneById(tournamentId);

    if (tournament.ownerId === userId) {
      throw new BadRequestException(TournamentError.OWNER_CANNOT_LEAVE_TOURNAMENT);
    }

    if (tournament.status !== TournamentStatus.DRAFT) {
      throw new BadRequestException(TournamentError.CANNOT_LEAVE_ACTIVE_TOURNAMENT);
    }

    const participant = await this.participantRepository.findOne({ where: { tournamentId, userId } });

    if (!participant) {
      return true;
    }

    await this.participantRepository.delete({ tournamentId, userId });

    this.eventsService.emitParticipantLeft(tournamentId, {
      tournamentId,
      userId,
      occurredAt: new Date().toISOString(),
    });
    await this.eventsService.ejectFromRoom(userId, tournamentId);

    return true;
  }
}
