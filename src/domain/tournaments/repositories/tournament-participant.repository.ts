import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { TournamentParticipantEntity } from '../entities/tournament-participant.entity';

@Injectable()
export class TournamentParticipantRepository extends Repository<TournamentParticipantEntity> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(TournamentParticipantEntity, entityManager);
  }
}
