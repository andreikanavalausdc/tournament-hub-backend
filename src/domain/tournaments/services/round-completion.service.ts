import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ParticipantStanding } from '@src/domain/tournaments/contracts/interfaces/participant-standing.interface';
import { RoundResult, RoundVoteAggregate } from '@src/domain/tournaments/contracts/interfaces/round-result.interface';
import { TournamentRoundCompletedPayload } from '@src/domain/tournaments/contracts/payloads/round-completed.payload';
import { TournamentRoundCreatedPayload } from '@src/domain/tournaments/contracts/payloads/round-created.payload';
import { TournamentFinishedPayload } from '@src/domain/tournaments/contracts/payloads/tournament-finished.payload';
import { TournamentEntity } from '@src/domain/tournaments/entities/tournament.entity';
import { TournamentParticipantEntity } from '@src/domain/tournaments/entities/tournament-participant.entity';
import { TournamentRoundEntity } from '@src/domain/tournaments/entities/tournament-round.entity';
import { TournamentRoundSubmissionEntity } from '@src/domain/tournaments/entities/tournament-round-submission.entity';
import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';
import { TournamentRoundVotingStepStatus } from '@src/domain/tournaments/enums/tournament-round-voting-step-status.enum';
import { TournamentStatus } from '@src/domain/tournaments/enums/tournament-status.enum';
import { TournamentVoteValue } from '@src/domain/tournaments/enums/tournament-vote-value.enum';
import { EntityManager } from 'typeorm';

import { TournamentRoundRepository } from '../repositories/tournament-round.repository';
import { RoundPromptService } from './round-prompt.service';
import { RoundResultCalculatorService } from './round-result-calculator.service';
import { RoundSubmissionPhaseService } from './round-submission-phase.service';
import { TournamentEventsService } from './tournament-events.service';

interface CompletionTransactionResult {
  completedPayload: TournamentRoundCompletedPayload;
  isLastRound: boolean;
  nextRoundNumber: number | null;
}

interface CompletionFollowUpResult {
  createdPayload: TournamentRoundCreatedPayload | null;
  finishedPayload: TournamentFinishedPayload | null;
  nextRound: TournamentRoundEntity | null;
}

interface RawVoteAggregate {
  submissionId: string;
  likeCount: string;
  dislikeCount: string;
}

@Injectable()
export class RoundCompletionService {
  private readonly nextRoundDelayMs = 3000;
  private readonly logger = new Logger(RoundCompletionService.name);

  constructor(
    private readonly roundRepository: TournamentRoundRepository,
    private readonly resultCalculator: RoundResultCalculatorService,
    private readonly eventsService: TournamentEventsService,
    private readonly moduleRef: ModuleRef,
    private readonly roundPromptService: RoundPromptService,
  ) {}

  async completeRound(roundId: string): Promise<void> {
    const result = await this.roundRepository.manager.transaction((entityManager) =>
      this.completeRoundInTransaction(entityManager, roundId),
    );

    if (!result) {
      return;
    }

    this.eventsService.emitRoundCompleted(result.completedPayload.tournamentId, result.completedPayload);

    await this.delay(this.nextRoundDelayMs);

    const followUp = await this.roundRepository.manager.transaction((entityManager) =>
      this.completeRoundFollowUpInTransaction(entityManager, roundId, result),
    );

    if (followUp?.nextRound) {
      const submissionPhaseService = this.moduleRef.get(RoundSubmissionPhaseService, { strict: false });
      submissionPhaseService.scheduleSubmissionDeadline(followUp.nextRound);
    }

    if (followUp?.createdPayload) {
      this.eventsService.emitRoundCreated(followUp.createdPayload.tournamentId, followUp.createdPayload);
    }

    if (followUp?.finishedPayload) {
      this.eventsService.emitTournamentFinished(followUp.finishedPayload.tournamentId, followUp.finishedPayload);
    }

    this.logger.log(`Completed round ${roundId}`);
  }

  private async completeRoundInTransaction(
    entityManager: EntityManager,
    roundId: string,
  ): Promise<CompletionTransactionResult | null> {
    const round = await entityManager.findOne(TournamentRoundEntity, {
      where: { id: roundId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!round || round.completedAt) {
      return null;
    }

    if (round.phase !== TournamentRoundPhase.VOTING || round.votingStepStatus !== TournamentRoundVotingStepStatus.FINISHED) {
      return null;
    }

    const tournament = await entityManager.findOne(TournamentEntity, {
      where: { id: round.tournamentId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!tournament || tournament.status !== TournamentStatus.ACTIVE) {
      return null;
    }

    const completedAt = new Date();
    const submissions = await entityManager.find(TournamentRoundSubmissionEntity, {
      where: { roundId },
      order: { submittedAt: 'ASC', id: 'ASC' },
    });
    const aggregates = await this.loadVoteAggregates(entityManager, roundId);
    const results = this.resultCalculator.calculate(submissions, aggregates);

    await this.persistRoundResults(entityManager, results);
    await this.updateCumulativeStandings(entityManager, round.tournamentId, results);

    round.completedAt = completedAt;
    await entityManager.save(TournamentRoundEntity, round);

    const leaderboard = await this.loadLeaderboard(entityManager, round.tournamentId);
    const isLastRound = round.number >= tournament.roundsCount;
    const nextRoundNumber = isLastRound ? null : round.number + 1;
    const completedPayload = this.buildRoundCompletedPayload(round, results, leaderboard, nextRoundNumber, completedAt);

    if (isLastRound) {
      return {
        completedPayload,
        isLastRound,
        nextRoundNumber,
      };
    }

    return {
      completedPayload,
      isLastRound,
      nextRoundNumber,
    };
  }

  private async completeRoundFollowUpInTransaction(
    entityManager: EntityManager,
    roundId: string,
    result: CompletionTransactionResult,
  ): Promise<CompletionFollowUpResult | null> {
    const round = await entityManager.findOne(TournamentRoundEntity, {
      where: { id: roundId },
    });

    if (!round?.completedAt) {
      return null;
    }

    const tournament = await entityManager.findOne(TournamentEntity, {
      where: { id: round.tournamentId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!tournament || tournament.status !== TournamentStatus.ACTIVE) {
      return null;
    }

    const now = new Date();

    if (result.isLastRound) {
      const leaderboard = await this.loadLeaderboard(entityManager, round.tournamentId);
      const finishedPayload = await this.finishTournament(entityManager, tournament, leaderboard, now);

      return {
        createdPayload: null,
        finishedPayload,
        nextRound: null,
      };
    }

    if (!result.nextRoundNumber) {
      return null;
    }

    const nextRound = await this.createNextRound(entityManager, tournament, result.nextRoundNumber, now);

    return {
      createdPayload: this.buildRoundCreatedPayload(nextRound, now),
      finishedPayload: null,
      nextRound,
    };
  }

  private async loadVoteAggregates(entityManager: EntityManager, roundId: string): Promise<RoundVoteAggregate[]> {
    const rows = await entityManager
      .createQueryBuilder()
      .select('vote.submission_id', 'submissionId')
      .addSelect('SUM(CASE WHEN vote.value = :like THEN 1 ELSE 0 END)', 'likeCount')
      .addSelect('SUM(CASE WHEN vote.value = :dislike THEN 1 ELSE 0 END)', 'dislikeCount')
      .from('tournament_round_votes', 'vote')
      .where('vote.round_id = :roundId', { roundId })
      .groupBy('vote.submission_id')
      .setParameters({ like: TournamentVoteValue.LIKE, dislike: TournamentVoteValue.DISLIKE })
      .getRawMany<RawVoteAggregate>();

    return rows.map((row) => ({
      submissionId: row.submissionId,
      likeCount: Number(row.likeCount),
      dislikeCount: Number(row.dislikeCount),
    }));
  }

  private async persistRoundResults(entityManager: EntityManager, results: RoundResult[]): Promise<void> {
    for (const result of results) {
      await entityManager.update(
        TournamentRoundSubmissionEntity,
        { id: result.submissionId },
        {
          likeCount: result.likeCount,
          dislikeCount: result.dislikeCount,
          roundScore: result.roundScore,
        },
      );
    }
  }

  private async updateCumulativeStandings(
    entityManager: EntityManager,
    tournamentId: string,
    results: RoundResult[],
  ): Promise<void> {
    for (const result of results) {
      await entityManager
        .createQueryBuilder()
        .update(TournamentParticipantEntity)
        .set({ cumulativeScore: () => 'cumulative_score + :roundScore' })
        .where('tournament_id = :tournamentId', { tournamentId })
        .andWhere('user_id = :userId', { userId: result.authorId })
        .setParameter('roundScore', result.roundScore)
        .execute();
    }
  }

  private async loadLeaderboard(
    entityManager: EntityManager,
    tournamentId: string,
  ): Promise<ParticipantStanding[]> {
    const participants = await entityManager.find(TournamentParticipantEntity, {
      where: { tournamentId },
      order: {
        cumulativeScore: 'DESC',
        createdAt: 'ASC',
        userId: 'ASC',
      },
    });

    return participants.map((participant, index) => ({
      userId: participant.userId,
      cumulativeScore: participant.cumulativeScore,
      rank: index + 1,
    }));
  }

  private async createNextRound(
    entityManager: EntityManager,
    tournament: TournamentEntity,
    nextRoundNumber: number,
    now: Date,
  ): Promise<TournamentRoundEntity> {
    const existingRound = await entityManager.findOne(TournamentRoundEntity, {
      where: { tournamentId: tournament.id, number: nextRoundNumber },
    });

    if (existingRound) {
      return existingRound;
    }

    const submissionDeadline = new Date(now.getTime() + tournament.submissionDurationSeconds * 1000);
    const prompt = await this.roundPromptService.generateForTournament(tournament.id, entityManager);
    const nextRound = entityManager.create(TournamentRoundEntity, {
      tournamentId: tournament.id,
      number: nextRoundNumber,
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

    return entityManager.save(TournamentRoundEntity, nextRound);
  }

  private async finishTournament(
    entityManager: EntityManager,
    tournament: TournamentEntity,
    leaderboard: ParticipantStanding[],
    finishedAt: Date,
  ): Promise<TournamentFinishedPayload> {
    const winnerId = leaderboard[0]?.userId ?? null;

    tournament.status = TournamentStatus.COMPLETED;
    tournament.winnerId = winnerId;
    await entityManager.save(TournamentEntity, tournament);

    return {
      tournamentId: tournament.id,
      status: TournamentStatus.COMPLETED,
      overallWinnerId: winnerId,
      finalLeaderboard: leaderboard,
      occurredAt: finishedAt.toISOString(),
    };
  }

  private buildRoundCompletedPayload(
    round: TournamentRoundEntity,
    results: RoundResult[],
    leaderboard: ParticipantStanding[],
    nextRoundNumber: number | null,
    completedAt: Date,
  ): TournamentRoundCompletedPayload {
    return {
      tournamentId: round.tournamentId,
      roundId: round.id,
      roundNumber: round.number,
      rankings: results.map((result) => ({
        submissionId: result.submissionId,
        authorId: result.authorId,
        likeCount: result.likeCount,
        dislikeCount: result.dislikeCount,
        score: result.roundScore,
      })),
      leaderboard,
      nextRoundNumber,
      isLastRound: nextRoundNumber === null,
      occurredAt: completedAt.toISOString(),
    };
  }

  private buildRoundCreatedPayload(
    round: TournamentRoundEntity,
    occurredAt: Date,
  ): TournamentRoundCreatedPayload {
    return {
      tournamentId: round.tournamentId,
      roundId: round.id,
      roundNumber: round.number,
      phase: TournamentRoundPhase.SUBMISSION,
      prompt: this.roundPromptService.toPrompt(round),
      submissionDeadline: round.submissionDeadline.toISOString(),
      occurredAt: occurredAt.toISOString(),
    };
  }

  private async delay(milliseconds: number): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }
}
