import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TOURNAMENTS_QUEUE_NAME } from '@src/domain/tournaments/contracts/jobs/tournament-events.job';
import { environment } from '@src/environment';
import { RedisModule } from '@src/modules/redis/redis.module';

import { TournamentControllerV1 } from './controllers/tournament.controller.v1';
import { TournamentRoundSubmissionControllerV1 } from './controllers/tournament-round-submission.controller.v1';
import { TournamentGateway } from './gateways/tournament.gateway';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { TournamentRepository } from './repositories/tournament.repository';
import { TournamentParticipantRepository } from './repositories/tournament-participant.repository';
import { TournamentRoundRepository } from './repositories/tournament-round.repository';
import { TournamentRoundSubmissionRepository } from './repositories/tournament-round-submission.repository';
import { RoundSubmissionPhaseService } from './services/round-submission-phase.service';
import { SubmissionPhaseDeadlineRegistryService } from './services/submission-phase-deadline-registry.service';
import { TournamentService } from './services/tournament.service';
import { TournamentEventsService } from './services/tournament-events.service';
import { TournamentPresenceService } from './services/tournament-presence.service';
import { TournamentRoomAccessService } from './services/tournament-room-access.service';
import { TournamentRoundSubmissionService } from './services/tournament-round-submission.service';
import { TournamentSocketEmitterService } from './services/tournament-socket-emitter.service';
import { WsJwtAuthService } from './services/ws-jwt-auth.service';
import { TournamentEventsProcessor } from './workers/tournament-events.worker';

@Module({
  imports: [
    JwtModule.register({
      secret: environment.jwt.secret,
      signOptions: { expiresIn: environment.jwt.expires },
    }),
    BullModule.registerQueue({
      name: TOURNAMENTS_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 500,
        },
        removeOnComplete: 1000,
        removeOnFail: 1000,
      },
    }),
    RedisModule,
  ],
  controllers: [TournamentControllerV1, TournamentRoundSubmissionControllerV1],
  providers: [
    TournamentParticipantRepository,
    TournamentRepository,
    TournamentRoundRepository,
    TournamentRoundSubmissionRepository,
    TournamentEventsService,
    TournamentSocketEmitterService,
    TournamentEventsProcessor,
    TournamentPresenceService,
    TournamentRoomAccessService,
    SubmissionPhaseDeadlineRegistryService,
    RoundSubmissionPhaseService,
    TournamentRoundSubmissionService,
    TournamentService,
    TournamentGateway,
    WsJwtAuthService,
    WsJwtGuard,
  ],
  exports: [TournamentService, TournamentEventsService, TournamentParticipantRepository],
})
export class TournamentsModule {}
