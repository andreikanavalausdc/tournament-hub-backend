import { Module } from '@nestjs/common';

import { TournamentControllerV1 } from './controllers/tournament.controller.v1';
import { TournamentRepository } from './repositories/tournament.repository';
import { TournamentParticipantRepository } from './repositories/tournament-participant.repository';
import { TournamentService } from './services/tournament.service';

@Module({
  controllers: [TournamentControllerV1],
  providers: [TournamentRepository, TournamentParticipantRepository, TournamentService],
  exports: [TournamentService],
})
export class TournamentsModule {}
