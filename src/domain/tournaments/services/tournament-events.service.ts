import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { TournamentEventPayload } from '@src/domain/tournaments/contracts/jobs/tournament-event-payload.job';
import { TournamentJobName,TOURNAMENTS_QUEUE_NAME } from '@src/domain/tournaments/contracts/jobs/tournament-events.job';
import { TournamentJobData } from '@src/domain/tournaments/contracts/jobs/tournament-events.job';
import { TournamentParticipantJoinedPayload } from '@src/domain/tournaments/contracts/payloads/participant-joined.payload';
import { TournamentParticipantLeftPayload } from '@src/domain/tournaments/contracts/payloads/participant-left.payload';
import { TournamentPresenceUpdatedPayload } from '@src/domain/tournaments/contracts/payloads/presence-updated.payload';
import { TournamentRoundCompletedPayload } from '@src/domain/tournaments/contracts/payloads/round-completed.payload';
import { TournamentRoundCreatedPayload } from '@src/domain/tournaments/contracts/payloads/round-created.payload';
import { TournamentRoundPhaseChangedPayload } from '@src/domain/tournaments/contracts/payloads/round-phase-changed.payload';
import { TournamentRoundProgressUpdatedPayload } from '@src/domain/tournaments/contracts/payloads/round-progress-updated.payload';
import { TournamentFinishedPayload } from '@src/domain/tournaments/contracts/payloads/tournament-finished.payload';
import { TournamentStartedPayload } from '@src/domain/tournaments/contracts/payloads/tournament-started.payload';
import { TournamentVoteFinalizedPayload } from '@src/domain/tournaments/contracts/payloads/vote-finalized.payload';
import { TournamentVoteProgressUpdatedPayload } from '@src/domain/tournaments/contracts/payloads/vote-progress-updated.payload';
import { TournamentVotingSubmissionRevealedPayload } from '@src/domain/tournaments/contracts/payloads/voting-submission-revealed.payload';
import { JobsOptions, Queue } from 'bullmq';

import { TournamentServerEvent } from '../contracts/events/tournament-server.event';

@Injectable()
export class TournamentEventsService {
  private readonly logger = new Logger(TournamentEventsService.name);

  constructor(@InjectQueue(TOURNAMENTS_QUEUE_NAME) private readonly queue: Queue<TournamentJobData>) {}

  emitPresenceUpdated(tournamentId: string, payload: TournamentPresenceUpdatedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.PRESENCE_UPDATED, payload);
  }

  emitParticipantJoined(tournamentId: string, payload: TournamentParticipantJoinedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.PARTICIPANT_JOINED, payload);
  }

  emitParticipantLeft(tournamentId: string, payload: TournamentParticipantLeftPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.PARTICIPANT_LEFT, payload);
  }

  emitTournamentStarted(tournamentId: string, payload: TournamentStartedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.TOURNAMENT_STARTED, payload);
  }

  emitRoundCreated(tournamentId: string, payload: TournamentRoundCreatedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.ROUND_CREATED, payload);
  }

  emitRoundPhaseChanged(tournamentId: string, payload: TournamentRoundPhaseChangedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.ROUND_PHASE_CHANGED, payload);
  }

  emitRoundProgressUpdated(tournamentId: string, payload: TournamentRoundProgressUpdatedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.ROUND_PROGRESS_UPDATED, payload);
  }

  emitVotingSubmissionRevealed(tournamentId: string, payload: TournamentVotingSubmissionRevealedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.VOTING_SUBMISSION_REVEALED, payload);
  }

  emitVoteProgressUpdated(tournamentId: string, payload: TournamentVoteProgressUpdatedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.VOTE_PROGRESS_UPDATED, payload);
  }

  emitVoteFinalized(tournamentId: string, payload: TournamentVoteFinalizedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.VOTE_FINALIZED, payload);
  }

  emitRoundCompleted(tournamentId: string, payload: TournamentRoundCompletedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.ROUND_COMPLETED, payload);
  }

  emitTournamentFinished(tournamentId: string, payload: TournamentFinishedPayload): void {
    this.enqueueBroadcastEvent(tournamentId, TournamentServerEvent.TOURNAMENT_FINISHED, payload);
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
