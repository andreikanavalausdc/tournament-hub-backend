import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { BaseRepository } from '@shared/repositories/base.repository';
import { EntityManager } from 'typeorm';

import { TournamentEntity } from '../entities/tournament.entity';

@Injectable()
export class TournamentRepository extends BaseRepository<TournamentEntity> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(TournamentEntity, entityManager);
  }
}
