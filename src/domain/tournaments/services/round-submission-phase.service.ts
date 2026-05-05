import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { TournamentRoundProgressUpdatedPayload } from '@src/domain/tournaments/contracts/payloads/round-progress-updated.payload';
import { TournamentRoundEntity } from '@src/domain/tournaments/entities/tournament-round.entity';
import { SubmissionPhaseCompletionReason } from '@src/domain/tournaments/enums/submission-phase-completion-reason.enum';
import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';
import { EntityManager } from 'typeorm';

import { TournamentRoundRepository } from '../repositories/tournament-round.repository';
import { TournamentRoundSubmissionRepository } from '../repositories/tournament-round-submission.repository';
import { SubmissionPhaseDeadlineRegistryService } from './submission-phase-deadline-registry.service';
import { TournamentEventsService } from './tournament-events.service';
import { TournamentPresenceService } from './tournament-presence.service';

@Injectable()
export class RoundSubmissionPhaseService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RoundSubmissionPhaseService.name);

  constructor(
    private readonly roundRepository: TournamentRoundRepository,
    private readonly submissionRepository: TournamentRoundSubmissionRepository,
    private readonly presenceService: TournamentPresenceService,
    private readonly eventsService: TournamentEventsService,
    private readonly deadlineRegistry: SubmissionPhaseDeadlineRegistryService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const rounds = await this.roundRepository.findSubmissionRounds();

    for (const round of rounds) {
      this.scheduleSubmissionDeadline(round);
    }
  }

  scheduleSubmissionDeadline(round: TournamentRoundEntity): void {
    this.deadlineRegistry.schedule(round.id, round.submissionDeadline, async () => {
      await this.tryCompleteSubmissionPhase(round.id, SubmissionPhaseCompletionReason.DEADLINE_EXPIRED);
    });
  }

  cancelSubmissionDeadline(roundId: string): void {
    this.deadlineRegistry.cancel(roundId);
  }

  async handleSubmissionSaved(roundId: string): Promise<void> {
    const round = await this.roundRepository.getOneById(roundId);

    if (round.phase !== TournamentRoundPhase.SUBMISSION) {
      return;
    }

    const totalActiveParticipants = await this.presenceService.getCount(round.tournamentId);
    const submittedCount = await this.submissionRepository.countDistinctAuthors(round.id);
    const occurredAt = new Date().toISOString();

    const payload: TournamentRoundProgressUpdatedPayload = {
      tournamentId: round.tournamentId,
      roundId: round.id,
      phase: TournamentRoundPhase.SUBMISSION,
      submittedCount,
      totalActiveParticipants,
      occurredAt,
    };

    this.eventsService.emitRoundProgressUpdated(round.tournamentId, payload);

    if (totalActiveParticipants === 0) {
      return;
    }

    if (submittedCount >= totalActiveParticipants) {
      await this.tryCompleteSubmissionPhase(
        round.id,
        SubmissionPhaseCompletionReason.ALL_ACTIVE_PARTICIPANTS_SUBMITTED,
      );
    }
  }

  async tryCompleteSubmissionPhase(roundId: string, reason: SubmissionPhaseCompletionReason): Promise<boolean> {
    const completedRound = await this.roundRepository.manager.transaction(async (entityManager) =>
      this.completeSubmissionPhaseInTransaction(entityManager, roundId),
    );

    if (!completedRound) {
      return false;
    }

    this.cancelSubmissionDeadline(completedRound.id);
    this.eventsService.emitRoundPhaseChanged(completedRound.tournamentId, {
      tournamentId: completedRound.tournamentId,
      roundId: completedRound.id,
      roundNumber: completedRound.number,
      previousPhase: TournamentRoundPhase.SUBMISSION,
      currentPhase: TournamentRoundPhase.VOTING,
      occurredAt: completedRound.submissionClosedAt?.toISOString() ?? new Date().toISOString(),
    });

    this.logger.log(`Completed submission phase for round ${roundId}: ${reason}`);

    return true;
  }

  private async completeSubmissionPhaseInTransaction(
    entityManager: EntityManager,
    roundId: string,
  ): Promise<TournamentRoundEntity | null> {
    const round = await entityManager.findOne(TournamentRoundEntity, {
      where: { id: roundId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!round) {
      return null;
    }

    if (round.phase !== TournamentRoundPhase.SUBMISSION) {
      return null;
    }

    const closedAt = new Date();

    round.phase = TournamentRoundPhase.VOTING;
    round.submissionClosedAt = closedAt;

    return entityManager.save(TournamentRoundEntity, round);
  }
}
