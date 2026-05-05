import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { BaseRepository } from '@shared/repositories/base.repository';
import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';
import { EntityManager } from 'typeorm';

import { TournamentRoundEntity } from '../entities/tournament-round.entity';

@Injectable()
export class TournamentRoundRepository extends BaseRepository<TournamentRoundEntity> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(TournamentRoundEntity, entityManager);
  }

  async findSubmissionRounds(): Promise<TournamentRoundEntity[]> {
    return this.find({ where: { phase: TournamentRoundPhase.SUBMISSION } });
  }
}
