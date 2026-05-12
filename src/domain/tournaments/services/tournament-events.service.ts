import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import {
  RoundCompletedAsyncApiDto,
  RoundCreatedAsyncApiDto,
  RoundPhaseChangedAsyncApiDto,
  RoundProgressUpdatedAsyncApiDto,
  TournamentFinishedAsyncApiDto,
  TournamentParticipantJoinedAsyncApiDto,
  TournamentParticipantLeftAsyncApiDto,
  TournamentPresenceUpdatedAsyncApiDto,
  TournamentStartedAsyncApiDto,
  VoteFinalizedAsyncApiDto,
  VoteProgressUpdatedAsyncApiDto,
  VotingSubmissionRevealedAsyncApiDto,
} from '@src/domain/tournaments/contracts/asyncapi/tournament-realtime-asyncapi.dto';
import type { TournamentEventPayload } from '@src/domain/tournaments/contracts/jobs/tournament-event-payload.job';
import { TournamentJobName,TOURNAMENTS_QUEUE_NAME } from '@src/domain/tournaments/contracts/jobs/tournament-events.job';
import type { TournamentJobData } from '@src/domain/tournaments/contracts/jobs/tournament-events.job';
import type { TournamentParticipantJoinedPayload } from '@src/domain/tournaments/contracts/payloads/participant-joined.payload';
import type { TournamentParticipantLeftPayload } from '@src/domain/tournaments/contracts/payloads/participant-left.payload';
import type { TournamentPresenceUpdatedPayload } from '@src/domain/tournaments/contracts/payloads/presence-updated.payload';
import type { TournamentRoundCompletedPayload } from '@src/domain/tournaments/contracts/payloads/round-completed.payload';
import type { TournamentRoundCreatedPayload } from '@src/domain/tournaments/contracts/payloads/round-created.payload';
import type { TournamentRoundPhaseChangedPayload } from '@src/domain/tournaments/contracts/payloads/round-phase-changed.payload';
import type { TournamentRoundProgressUpdatedPayload } from '@src/domain/tournaments/contracts/payloads/round-progress-updated.payload';
import type { TournamentCancelledPayload } from '@src/domain/tournaments/contracts/payloads/tournament-cancelled.payload';
import type { TournamentFinishedPayload } from '@src/domain/tournaments/contracts/payloads/tournament-finished.payload';
import type { TournamentStartedPayload } from '@src/domain/tournaments/contracts/payloads/tournament-started.payload';
import type { TournamentVoteFinalizedPayload } from '@src/domain/tournaments/contracts/payloads/vote-finalized.payload';
import type { TournamentVoteProgressUpdatedPayload } from '@src/domain/tournaments/contracts/payloads/vote-progress-updated.payload';
import type { TournamentVotingSubmissionRevealedPayload } from '@src/domain/tournaments/contracts/payloads/voting-submission-revealed.payload';
import { Queue } from 'bullmq';
import type { JobsOptions } from 'bullmq';
import { AsyncApi, AsyncApiSend } from 'nestjs-asyncapi';

import { TournamentServerEvent } from '../contracts/events/tournament-server.event';

@Injectable()
@AsyncApi()
export class TournamentEventsService {
  private readonly logger = new Logger(TournamentEventsService.name);

  constructor(@InjectQueue(TOURNAMENTS_QUEUE_NAME) private readonly queue: Queue<TournamentJobData>) {}

  @AsyncApiSend({
    channel: TournamentServerEvent.PRESENCE_UPDATED,
    operationId: 'emitTournamentPresenceUpdated',
    title: 'Tournament presence updated',
    summary: 'Server emits the current unique active participant count.',
    description:
      'Lightweight MVP presence event emitted to room tournament:{tournamentId}. It does not include connected user IDs.',
    message: {
      name: TournamentServerEvent.PRESENCE_UPDATED,
      payload: TournamentPresenceUpdatedAsyncApiDto,
    },
  })
  emitPresenceUpdated(tournamentId: string, payload: TournamentPresenceUpdatedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.PRESENCE_UPDATED, payload);
  }

  @AsyncApiSend({
    channel: TournamentServerEvent.PARTICIPANT_JOINED,
    operationId: 'emitTournamentParticipantJoined',
    title: 'Tournament participant joined',
    summary: 'Server notifies room members that a participant joined through REST.',
    message: {
      name: TournamentServerEvent.PARTICIPANT_JOINED,
      payload: TournamentParticipantJoinedAsyncApiDto,
    },
  })
  emitParticipantJoined(tournamentId: string, payload: TournamentParticipantJoinedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.PARTICIPANT_JOINED, payload);
  }

  @AsyncApiSend({
    channel: TournamentServerEvent.PARTICIPANT_LEFT,
    operationId: 'emitTournamentParticipantLeft',
    title: 'Tournament participant left',
    summary: 'Server notifies room members that a participant left through REST.',
    description: 'Socket disconnects do not emit this event.',
    message: {
      name: TournamentServerEvent.PARTICIPANT_LEFT,
      payload: TournamentParticipantLeftAsyncApiDto,
    },
  })
  emitParticipantLeft(tournamentId: string, payload: TournamentParticipantLeftPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.PARTICIPANT_LEFT, payload);
  }

  @AsyncApiSend({
    channel: TournamentServerEvent.TOURNAMENT_STARTED,
    operationId: 'emitTournamentStarted',
    title: 'Tournament started',
    summary: 'Server notifies room members that the tournament became ACTIVE.',
    message: {
      name: TournamentServerEvent.TOURNAMENT_STARTED,
      payload: TournamentStartedAsyncApiDto,
    },
  })
  emitTournamentStarted(tournamentId: string, payload: TournamentStartedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.TOURNAMENT_STARTED, payload);
  }

  @AsyncApiSend({
    channel: TournamentServerEvent.ROUND_CREATED,
    operationId: 'emitRoundCreated',
    title: 'Round created',
    summary: 'Server notifies room members that a new submission round was created.',
    message: {
      name: TournamentServerEvent.ROUND_CREATED,
      payload: RoundCreatedAsyncApiDto,
    },
  })
  emitRoundCreated(tournamentId: string, payload: TournamentRoundCreatedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.ROUND_CREATED, payload);
  }

  @AsyncApiSend({
    channel: TournamentServerEvent.ROUND_PHASE_CHANGED,
    operationId: 'emitRoundPhaseChanged',
    title: 'Round phase changed',
    summary: 'Server notifies room members that the round moved from SUBMISSION to VOTING.',
    description: 'This event is only used for SUBMISSION -> VOTING. Round completion uses round:completed.',
    message: {
      name: TournamentServerEvent.ROUND_PHASE_CHANGED,
      payload: RoundPhaseChangedAsyncApiDto,
    },
  })
  emitRoundPhaseChanged(tournamentId: string, payload: TournamentRoundPhaseChangedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.ROUND_PHASE_CHANGED, payload);
  }

  @AsyncApiSend({
    channel: TournamentServerEvent.ROUND_PROGRESS_UPDATED,
    operationId: 'emitRoundProgressUpdated',
    title: 'Round progress updated',
    summary: 'Server emits submission progress counters.',
    description: 'This event intentionally exposes counters only and never broadcasts raw submission content.',
    message: {
      name: TournamentServerEvent.ROUND_PROGRESS_UPDATED,
      payload: RoundProgressUpdatedAsyncApiDto,
    },
  })
  emitRoundProgressUpdated(tournamentId: string, payload: TournamentRoundProgressUpdatedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.ROUND_PROGRESS_UPDATED, payload);
  }

  @AsyncApiSend({
    channel: TournamentServerEvent.VOTING_SUBMISSION_REVEALED,
    operationId: 'emitVotingSubmissionRevealed',
    title: 'Voting submission revealed',
    summary: 'Server reveals one submission as the current immediate voting target.',
    description:
      'Voting is sequential. After this submission is finalized, the server reveals the next submission or completes the round.',
    message: {
      name: TournamentServerEvent.VOTING_SUBMISSION_REVEALED,
      payload: VotingSubmissionRevealedAsyncApiDto,
    },
  })
  emitVotingSubmissionRevealed(tournamentId: string, payload: TournamentVotingSubmissionRevealedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.VOTING_SUBMISSION_REVEALED, payload);
  }

  @AsyncApiSend({
    channel: TournamentServerEvent.VOTE_PROGRESS_UPDATED,
    operationId: 'emitVoteProgressUpdated',
    title: 'Vote progress updated',
    summary: 'Server emits aggregate vote progress for the currently revealed submission.',
    description: 'Progress uses eligible active voters, not all tournament participants.',
    message: {
      name: TournamentServerEvent.VOTE_PROGRESS_UPDATED,
      payload: VoteProgressUpdatedAsyncApiDto,
    },
  })
  emitVoteProgressUpdated(tournamentId: string, payload: TournamentVoteProgressUpdatedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.VOTE_PROGRESS_UPDATED, payload);
  }

  @AsyncApiSend({
    channel: TournamentServerEvent.VOTE_FINALIZED,
    operationId: 'emitVoteFinalized',
    title: 'Vote finalized',
    summary: 'Server emits the finalized result for one currently revealed submission.',
    description: 'This is a per-submission result event, not a whole-round result event.',
    message: {
      name: TournamentServerEvent.VOTE_FINALIZED,
      payload: VoteFinalizedAsyncApiDto,
    },
  })
  emitVoteFinalized(tournamentId: string, payload: TournamentVoteFinalizedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.VOTE_FINALIZED, payload);
  }

  @AsyncApiSend({
    channel: TournamentServerEvent.ROUND_COMPLETED,
    operationId: 'emitRoundCompleted',
    title: 'Round completed',
    summary: 'Server emits whole-round rankings and the cumulative leaderboard.',
    message: {
      name: TournamentServerEvent.ROUND_COMPLETED,
      payload: RoundCompletedAsyncApiDto,
    },
  })
  emitRoundCompleted(tournamentId: string, payload: TournamentRoundCompletedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.ROUND_COMPLETED, payload);
  }

  @AsyncApiSend({
    channel: TournamentServerEvent.TOURNAMENT_FINISHED,
    operationId: 'emitTournamentFinished',
    title: 'Tournament finished',
    summary: 'Server notifies room members that all rounds are completed.',
    message: {
      name: TournamentServerEvent.TOURNAMENT_FINISHED,
      payload: TournamentFinishedAsyncApiDto,
    },
  })
  emitTournamentFinished(tournamentId: string, payload: TournamentFinishedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.TOURNAMENT_FINISHED, payload);
  }

  emitTournamentCancelled(tournamentId: string, payload: TournamentCancelledPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.TOURNAMENT_CANCELLED, payload);
  }

  async ejectFromRoom(userId: string, tournamentId: string): Promise<void> {
    await this.queue.add(TournamentJobName.EJECT_FROM_ROOM, { userId, tournamentId });
  }

  private enqueueBroadcastEvent(tournamentId: string, event: TournamentServerEvent, payload: TournamentEventPayload): void {
    const jobOptions: JobsOptions = {
      jobId: this.buildBroadcastJobId(tournamentId, event, payload.occurredAt),
    };

    void this.queue.add(TournamentJobName.BROADCAST_EVENT, { event, payload, tournamentId }, jobOptions).catch((error: unknown) => {
      const reason = error instanceof Error ? error.message : 'unknown';
      this.logger.error(`Failed to enqueue tournament event: ${reason}`);
    });
  }

  private buildBroadcastJobId(tournamentId: string, event: TournamentServerEvent, occurredAt: string): string {
    const safeEvent = event.replaceAll(':', '_');
    const occurredAtTimestamp = Date.parse(occurredAt);
    const safeOccurredAt = Number.isNaN(occurredAtTimestamp)
      ? occurredAt.replace(/[^a-zA-Z0-9_.-]/g, '_')
      : `${occurredAtTimestamp}`;

    return `broadcast_${safeEvent}_${tournamentId}_${safeOccurredAt}`;
  }
}
