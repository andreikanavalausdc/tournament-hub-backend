import { randomUUID } from 'node:crypto';

import { BadRequestException, ConflictException, ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { MAX_TOURNAMENT_ROUNDS } from '@src/domain/tournaments/constants/round-prompts.constant';
import type { JoinTournamentInput } from '@src/domain/tournaments/contracts/inputs/join-tournament.input';
import { TournamentRoundEntity } from '@src/domain/tournaments/entities/tournament-round.entity';
import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';
import { TournamentStatus } from '@src/domain/tournaments/enums/tournament-status.enum';
import { TournamentVisibility } from '@src/domain/tournaments/enums/tournament-visibility.enum';
import type { EntityManager } from 'typeorm';

import type { CreateTournamentInput } from '../contracts/inputs/create-tournament.input';
import { TournamentEntity } from '../entities/tournament.entity';
import { TournamentParticipantEntity } from '../entities/tournament-participant.entity';
import { TournamentError } from '../enums/tournament-error.enum';
import { TournamentRepository } from '../repositories/tournament.repository';
import { TournamentParticipantRepository } from '../repositories/tournament-participant.repository';
import { ActiveTournamentParticipationPolicyService } from './active-tournament-participation-policy.service';
import { RoundPromptService } from './round-prompt.service';
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
    private readonly activeParticipationPolicy: ActiveTournamentParticipationPolicyService,
    private readonly roundPromptService: RoundPromptService,
  ) {}

  async create(input: CreateTournamentInput): Promise<TournamentEntity> {
    const { title, description, visibility, roundsCount, submissionDurationSeconds, voteDurationSeconds, ownerId } =
      input;

    if (roundsCount > MAX_TOURNAMENT_ROUNDS) {
      throw new BadRequestException(TournamentError.INVALID_ROUNDS_COUNT);
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
        await this.acquireActiveParticipationLocks(em, [ownerId]);

        const openOwnedTournament = await this.repository.findOpenOwnedTournamentByOwnerId(ownerId, em);

        if (openOwnedTournament) {
          throw new ConflictException(TournamentError.ALREADY_OWNS_UNFINISHED_TOURNAMENT);
        }

        const saved = await em.save(TournamentEntity, tournament);

        // Draft participation is allowed; active-participation conflicts are checked when joining ACTIVE or starting.
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

    const shouldEmitParticipantJoined = await this.repository.manager.transaction(async (em) => {
      const tournament = await em.findOne(TournamentEntity, {
        where: { id: tournamentId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!tournament) {
        throw new BadRequestException(`${this.repository.metadata.tableName}.main.NOT_FOUND`);
      }

      if ([TournamentStatus.COMPLETED, TournamentStatus.CANCELLED].includes(tournament.status)) {
        throw new BadRequestException(TournamentError.CANNOT_JOIN_FINISHED_TOURNAMENT);
      }

      const isAlreadyParticipant = await em.exists(TournamentParticipantEntity, { where: { tournamentId, userId } });

      if (isAlreadyParticipant) {
        return false;
      }

      if (tournament.visibility === TournamentVisibility.PRIVATE) {
        if (!inviteToken) {
          throw new BadRequestException(TournamentError.PRIVATE_JOIN_REQUIRES_INVITE_TOKEN);
        }

        if (tournament.inviteToken !== inviteToken) {
          throw new BadRequestException(TournamentError.INVALID_INVITE_TOKEN);
        }
      }

      if (tournament.status === TournamentStatus.ACTIVE) {
        await this.acquireActiveParticipationLocks(em, [userId]);
        await this.activeParticipationPolicy.assertNoOtherActiveTournament(userId, tournamentId, em);
      }

      await em.save(TournamentParticipantEntity, { tournamentId, userId });

      return true;
    });

    if (!shouldEmitParticipantJoined) {
      return true;
    }

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

      const participantUserIds = await this.findParticipantUserIds(em, tournamentId);
      await this.acquireActiveParticipationLocks(em, participantUserIds);
      await this.activeParticipationPolicy.assertParticipantsHaveNoOtherActiveTournament(
        participantUserIds,
        tournamentId,
        em,
      );

      const submissionDeadline = new Date(Date.now() + tournament.submissionDurationSeconds * 1000);
      const prompt = await this.roundPromptService.generateForTournament(tournamentId, em);

      tournament.status = TournamentStatus.ACTIVE;
      await em.save(TournamentEntity, tournament);

      const round = em.create(TournamentRoundEntity, {
        tournamentId,
        number: 1,
        phase: TournamentRoundPhase.SUBMISSION,
        ...prompt,
        submissionDeadline,
        submissionClosedAt: null,
        currentVotingSubmissionId: null,
        currentRevealIndex: null,
        votingDeadline: null,
        votingCompletedAt: null,
        completedAt: null,
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
      prompt: this.roundPromptService.toPrompt(started.round),
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

  async cancel(tournamentId: string, userId: string): Promise<boolean> {
    const participantUserIds = await this.repository.manager.transaction(async (em) => {
      const tournament = await em.findOne(TournamentEntity, {
        where: { id: tournamentId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!tournament) {
        throw new BadRequestException(`${this.repository.metadata.tableName}.main.NOT_FOUND`);
      }

      if (tournament.ownerId !== userId) {
        throw new ForbiddenException(TournamentError.ONLY_OWNER_CAN_CANCEL_TOURNAMENT);
      }

      if (tournament.status !== TournamentStatus.DRAFT) {
        throw new BadRequestException(TournamentError.CANNOT_CANCEL_NON_DRAFT_TOURNAMENT);
      }

      const participants = await this.findParticipantUserIds(em, tournamentId);

      tournament.status = TournamentStatus.CANCELLED;
      await em.save(TournamentEntity, tournament);
      await em.delete(TournamentParticipantEntity, { tournamentId });

      return participants;
    });

    this.eventsService.emitTournamentCancelled(tournamentId, {
      tournamentId,
      status: TournamentStatus.CANCELLED,
      occurredAt: new Date().toISOString(),
    });

    for (const participantUserId of participantUserIds) {
      await this.eventsService.ejectFromRoom(participantUserId, tournamentId);
    }

    return true;
  }

  private async findParticipantUserIds(em: EntityManager, tournamentId: string): Promise<string[]> {
    const participants = await em.find(TournamentParticipantEntity, {
      where: { tournamentId },
      select: { userId: true },
    });

    return participants.map((participant) => participant.userId);
  }

  private async acquireActiveParticipationLocks(em: EntityManager, userIds: string[]): Promise<void> {
    const uniqueUserIds = [...new Set(userIds)].sort();

    for (const userId of uniqueUserIds) {
      await em.query('SELECT pg_advisory_xact_lock(hashtext($1))', [userId]);
    }
  }
}
