import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import {
  BroadcastEventJobData,
  EjectFromRoomJobData,
  TournamentJob,
  TournamentJobData,
  TournamentJobName,
  TOURNAMENTS_QUEUE_NAME,
} from '@src/domain/tournaments/contracts/jobs/tournament-events.job';
import { Job } from 'bullmq';

import { TournamentSocketEmitterService } from '../services/tournament-socket-emitter.service';

@Injectable()
@Processor(TOURNAMENTS_QUEUE_NAME)
export class TournamentEventsProcessor extends WorkerHost {
  constructor(private readonly socketEmitterService: TournamentSocketEmitterService) {
    super();
  }

  async process(job: Job<TournamentJobData, void, TournamentJob>): Promise<void> {
    switch (job.name) {
      case TournamentJobName.BROADCAST_EVENT:
        this.handleBroadcastEventJob(job.data as BroadcastEventJobData);
        return;
      case TournamentJobName.EJECT_FROM_ROOM:
        await this.handleEjectFromRoomJob(job.data as EjectFromRoomJobData);
        return;
      default:
        throw new Error(`Unknown tournament events job: ${job.name}`);
    }
  }

  private handleBroadcastEventJob(data: BroadcastEventJobData): void {
    this.socketEmitterService.emit(data.tournamentId, data.event, data.payload);
  }

  private async handleEjectFromRoomJob(data: EjectFromRoomJobData): Promise<void> {
    await this.socketEmitterService.ejectFromRoom(data.userId, data.tournamentId);
  }
}


