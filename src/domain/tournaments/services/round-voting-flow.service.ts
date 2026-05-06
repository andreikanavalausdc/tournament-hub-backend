import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { TournamentVoteFinalizedPayload } from '@src/domain/tournaments/contracts/payloads/vote-finalized.payload';
import { TournamentVotingSubmissionRevealedPayload } from '@src/domain/tournaments/contracts/payloads/voting-submission-revealed.payload';
import { TournamentEntity } from '@src/domain/tournaments/entities/tournament.entity';
import { TournamentRoundEntity } from '@src/domain/tournaments/entities/tournament-round.entity';
import { TournamentRoundSubmissionEntity } from '@src/domain/tournaments/entities/tournament-round-submission.entity';
import { TournamentRoundVoteEntity } from '@src/domain/tournaments/entities/tournament-round-vote.entity';
import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';
import { TournamentRoundVotingStepStatus } from '@src/domain/tournaments/enums/tournament-round-voting-step-status.enum';
import { TournamentVoteSource } from '@src/domain/tournaments/enums/tournament-vote-source.enum';
import { TournamentVoteValue } from '@src/domain/tournaments/enums/tournament-vote-value.enum';
import { VotingFinalizationReason } from '@src/domain/tournaments/enums/voting-finalization-reason.enum';
import { EntityManager } from 'typeorm';

import { TournamentParticipantRepository } from '../repositories/tournament-participant.repository';
import { TournamentRoundRepository } from '../repositories/tournament-round.repository';
import { TournamentRoundSubmissionRepository } from '../repositories/tournament-round-submission.repository';
import { TournamentRoundVoteRepository } from '../repositories/tournament-round-vote.repository';
import { TournamentEventsService } from './tournament-events.service';
import { TournamentPresenceService } from './tournament-presence.service';
import { VotingDeadlineRegistryService } from './voting-deadline-registry.service';

interface VotingStepStartedResult {
  revealPayload: TournamentVotingSubmissionRevealedPayload;
  deadline: Date;
}

interface VotingStepFinalizedResult {
  finalizedPayload: TournamentVoteFinalizedPayload;
  nextRevealPayload: TournamentVotingSubmissionRevealedPayload | null;
  nextDeadline: Date | null;
}

@Injectable()
export class RoundVotingFlowService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RoundVotingFlowService.name);

  constructor(
    private readonly roundRepository: TournamentRoundRepository,
    private readonly submissionRepository: TournamentRoundSubmissionRepository,
    private readonly voteRepository: TournamentRoundVoteRepository,
    private readonly participantRepository: TournamentParticipantRepository,
    private readonly presenceService: TournamentPresenceService,
    private readonly eventsService: TournamentEventsService,
    private readonly deadlineRegistry: VotingDeadlineRegistryService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const rounds = await this.roundRepository.findOpenVotingRounds();

    for (const round of rounds) {
      this.scheduleVotingDeadline(round);
    }
  }

  async startVotingPhase(roundId: string): Promise<boolean> {
    const result = await this.roundRepository.manager.transaction((entityManager) =>
      this.startVotingPhaseInTransaction(entityManager, roundId),
    );

    if (!result) {
      return false;
    }

    this.eventsService.emitVotingSubmissionRevealed(result.revealPayload.tournamentId, result.revealPayload);
    this.deadlineRegistry.schedule(result.revealPayload.roundId, result.deadline, async () => {
      await this.tryFinalizeCurrentSubmission(result.revealPayload.roundId, VotingFinalizationReason.DEADLINE_EXPIRED);
    });

    return true;
  }

  async handleManualVoteSaved(roundId: string): Promise<void> {
    const round = await this.roundRepository.getOneById(roundId);

    if (
      round.phase !== TournamentRoundPhase.VOTING ||
      round.votingStepStatus !== TournamentRoundVotingStepStatus.OPEN ||
      !round.currentVotingSubmissionId
    ) {
      return;
    }

    await this.emitVoteProgress(round);
    await this.tryFinalizeWhenAllActiveEligibleVotersVoted(round);
  }

  async tryFinalizeCurrentSubmission(roundId: string, reason: VotingFinalizationReason): Promise<boolean> {
    const result = await this.roundRepository.manager.transaction((entityManager) =>
      this.finalizeCurrentSubmissionInTransaction(entityManager, roundId, reason),
    );

    if (!result) {
      return false;
    }

    this.deadlineRegistry.cancel(roundId);
    this.eventsService.emitVoteFinalized(result.finalizedPayload.tournamentId, result.finalizedPayload);

    const nextRevealPayload = result.nextRevealPayload;

    if (nextRevealPayload && result.nextDeadline) {
      this.eventsService.emitVotingSubmissionRevealed(nextRevealPayload.tournamentId, nextRevealPayload);
      this.deadlineRegistry.schedule(nextRevealPayload.roundId, result.nextDeadline, async () => {
        await this.tryFinalizeCurrentSubmission(nextRevealPayload.roundId, VotingFinalizationReason.DEADLINE_EXPIRED);
      });
    }

    this.logger.log(`Finalized current voting submission for round ${roundId}: ${reason}`);

    return true;
  }

  private scheduleVotingDeadline(round: TournamentRoundEntity): void {
    if (!round.votingDeadline) {
      return;
    }

    this.deadlineRegistry.schedule(round.id, round.votingDeadline, async () => {
      await this.tryFinalizeCurrentSubmission(round.id, VotingFinalizationReason.DEADLINE_EXPIRED);
    });
  }

  private async startVotingPhaseInTransaction(
    entityManager: EntityManager,
    roundId: string,
  ): Promise<VotingStepStartedResult | null> {
    const round = await entityManager.findOne(TournamentRoundEntity, {
      where: { id: roundId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!round || round.phase !== TournamentRoundPhase.VOTING) {
      return null;
    }

    if (round.votingStepStatus !== TournamentRoundVotingStepStatus.IDLE) {
      return null;
    }

    const submissions = await entityManager.find(TournamentRoundSubmissionEntity, {
      where: { roundId },
      order: { submittedAt: 'ASC', id: 'ASC' },
    });
    const firstSubmission = submissions[0];

    if (!firstSubmission) {
      round.votingStepStatus = TournamentRoundVotingStepStatus.FINISHED;
      round.votingCompletedAt = new Date();
      await entityManager.save(TournamentRoundEntity, round);

      return null;
    }

    const tournament = await entityManager.findOneByOrFail(TournamentEntity, { id: round.tournamentId });
    const deadline = new Date(Date.now() + tournament.voteDurationSeconds * 1000);

    round.currentVotingSubmissionId = firstSubmission.id;
    round.currentRevealIndex = 0;
    round.votingDeadline = deadline;
    round.votingStepStatus = TournamentRoundVotingStepStatus.OPEN;
    round.votingCompletedAt = null;

    await entityManager.save(TournamentRoundEntity, round);

    return {
      revealPayload: this.buildRevealPayload(round, firstSubmission, 0, submissions.length, deadline),
      deadline,
    };
  }

  private async emitVoteProgress(round: TournamentRoundEntity): Promise<void> {
    if (!round.currentVotingSubmissionId) {
      return;
    }

    const submission = await this.submissionRepository.getOneById(round.currentVotingSubmissionId);
    const activeEligibleVoterIds = await this.getActiveEligibleVoterIds(round.tournamentId, submission.authorId);
    const votedCount = await this.voteRepository.countVoters(round.id, submission.id, activeEligibleVoterIds);

    this.eventsService.emitVoteProgressUpdated(round.tournamentId, {
      tournamentId: round.tournamentId,
      roundId: round.id,
      submissionId: submission.id,
      votedCount,
      totalEligibleActiveVoters: activeEligibleVoterIds.length,
      occurredAt: new Date().toISOString(),
    });
  }

  private async tryFinalizeWhenAllActiveEligibleVotersVoted(round: TournamentRoundEntity): Promise<void> {
    if (!round.currentVotingSubmissionId) {
      return;
    }

    const submission = await this.submissionRepository.getOneById(round.currentVotingSubmissionId);
    const activeEligibleVoterIds = await this.getActiveEligibleVoterIds(round.tournamentId, submission.authorId);

    if (activeEligibleVoterIds.length === 0) {
      return;
    }

    const votedCount = await this.voteRepository.countVoters(round.id, submission.id, activeEligibleVoterIds);

    if (votedCount >= activeEligibleVoterIds.length) {
      await this.tryFinalizeCurrentSubmission(round.id, VotingFinalizationReason.ALL_ACTIVE_ELIGIBLE_VOTERS_VOTED);
    }
  }

  private async finalizeCurrentSubmissionInTransaction(
    entityManager: EntityManager,
    roundId: string,
    reason: VotingFinalizationReason,
  ): Promise<VotingStepFinalizedResult | null> {
    const round = await entityManager.findOne(TournamentRoundEntity, {
      where: { id: roundId },
      lock: { mode: 'pessimistic_write' },
    });

    if (
      !round ||
      round.phase !== TournamentRoundPhase.VOTING ||
      round.votingStepStatus !== TournamentRoundVotingStepStatus.OPEN ||
      !round.currentVotingSubmissionId ||
      !round.votingDeadline
    ) {
      return null;
    }

    if (reason === VotingFinalizationReason.DEADLINE_EXPIRED && round.votingDeadline.getTime() > Date.now()) {
      return null;
    }

    const submission = await entityManager.findOneByOrFail(TournamentRoundSubmissionEntity, {
      id: round.currentVotingSubmissionId,
    });
    const submissions = await entityManager.find(TournamentRoundSubmissionEntity, {
      where: { roundId },
      order: { submittedAt: 'ASC', id: 'ASC' },
    });
    const currentIndex = submissions.findIndex((orderedSubmission) => orderedSubmission.id === submission.id);

    if (currentIndex < 0) {
      return null;
    }

    round.votingStepStatus = TournamentRoundVotingStepStatus.FINALIZING;
    await entityManager.save(TournamentRoundEntity, round);

    const allEligibleVoterIds = await this.getEligibleVoterIds(entityManager, round.tournamentId, submission.authorId);
    const existingVoterIds = await this.getExistingVoterIds(entityManager, round.id, submission.id);
    const existingVoterIdSet = new Set(existingVoterIds);
    const missingVotes = allEligibleVoterIds
      .filter((voterId) => !existingVoterIdSet.has(voterId))
      .map((voterId) =>
        entityManager.create(TournamentRoundVoteEntity, {
          roundId: round.id,
          submissionId: submission.id,
          voterId,
          value: TournamentVoteValue.DISLIKE,
          source: TournamentVoteSource.AUTO_TIMEOUT,
          votedAt: new Date(),
        }),
      );

    if (missingVotes.length > 0) {
      await entityManager.save(TournamentRoundVoteEntity, missingVotes);
    }

    const likeCount = await entityManager.count(TournamentRoundVoteEntity, {
      where: { roundId: round.id, submissionId: submission.id, value: TournamentVoteValue.LIKE },
    });
    const dislikeCount = await entityManager.count(TournamentRoundVoteEntity, {
      where: { roundId: round.id, submissionId: submission.id, value: TournamentVoteValue.DISLIKE },
    });
    const nextIndex = currentIndex + 1;
    const nextSubmission = submissions[nextIndex] ?? null;
    const finalizedPayload: TournamentVoteFinalizedPayload = {
      tournamentId: round.tournamentId,
      roundId: round.id,
      submissionId: submission.id,
      likeCount,
      dislikeCount,
      occurredAt: new Date().toISOString(),
    };

    if (!nextSubmission) {
      round.currentVotingSubmissionId = null;
      round.currentRevealIndex = null;
      round.votingDeadline = null;
      round.votingStepStatus = TournamentRoundVotingStepStatus.FINISHED;
      round.votingCompletedAt = new Date();
      await entityManager.save(TournamentRoundEntity, round);

      return { finalizedPayload, nextRevealPayload: null, nextDeadline: null };
    }

    const tournament = await entityManager.findOneByOrFail(TournamentEntity, { id: round.tournamentId });
    const nextDeadline = new Date(Date.now() + tournament.voteDurationSeconds * 1000);

    round.currentVotingSubmissionId = nextSubmission.id;
    round.currentRevealIndex = nextIndex;
    round.votingDeadline = nextDeadline;
    round.votingStepStatus = TournamentRoundVotingStepStatus.OPEN;
    await entityManager.save(TournamentRoundEntity, round);

    return {
      finalizedPayload,
      nextRevealPayload: this.buildRevealPayload(round, nextSubmission, nextIndex, submissions.length, nextDeadline),
      nextDeadline,
    };
  }

  private buildRevealPayload(
    round: TournamentRoundEntity,
    submission: TournamentRoundSubmissionEntity,
    revealIndex: number,
    totalSubmissions: number,
    votingDeadline: Date,
  ): TournamentVotingSubmissionRevealedPayload {
    return {
      tournamentId: round.tournamentId,
      roundId: round.id,
      submission: {
        id: submission.id,
        authorId: submission.authorId,
        content: submission.content,
        submittedAt: submission.submittedAt.toISOString(),
      },
      revealIndex,
      totalSubmissions,
      votingDeadline: votingDeadline.toISOString(),
      occurredAt: new Date().toISOString(),
    };
  }

  private async getActiveEligibleVoterIds(tournamentId: string, authorId: string): Promise<string[]> {
    const participantUserIds = await this.participantRepository.findUserIdsByTournamentId(tournamentId);
    const activeUserIds = await this.presenceService.getUserIds(tournamentId);
    const activeUserIdSet = new Set(activeUserIds);

    return participantUserIds.filter((userId) => userId !== authorId && activeUserIdSet.has(userId));
  }

  private async getEligibleVoterIds(
    entityManager: EntityManager,
    tournamentId: string,
    authorId: string,
  ): Promise<string[]> {
    const rows = await entityManager
      .createQueryBuilder()
      .select('participant.user_id', 'userId')
      .from('tournament_participants', 'participant')
      .where('participant.tournament_id = :tournamentId', { tournamentId })
      .andWhere('participant.user_id <> :authorId', { authorId })
      .getRawMany<{ userId: string }>();

    return rows.map((row) => row.userId);
  }

  private async getExistingVoterIds(
    entityManager: EntityManager,
    roundId: string,
    submissionId: string,
  ): Promise<string[]> {
    const rows = await entityManager.find(TournamentRoundVoteEntity, {
      where: { roundId, submissionId },
      select: { voterId: true },
    });

    return rows.map((row) => row.voterId);
  }
}
