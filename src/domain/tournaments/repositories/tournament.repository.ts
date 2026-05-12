import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { BaseRepository } from '@shared/repositories/base.repository';
import { EntityManager } from 'typeorm';

import { TournamentEntity } from '../entities/tournament.entity';
import { TournamentStatus } from '../enums/tournament-status.enum';

export type OpenOwnedTournamentRead = {
  id: string;
};

@Injectable()
export class TournamentRepository extends BaseRepository<TournamentEntity> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(TournamentEntity, entityManager);
  }

  async findOpenOwnedTournamentByOwnerId(
    ownerId: string,
    manager?: EntityManager,
  ): Promise<OpenOwnedTournamentRead | null> {
    const repository = manager?.getRepository(TournamentEntity) ?? this;

    const result = await repository
      .createQueryBuilder(this.metadata.tableName)
      .select(`${this.metadata.tableName}.id`, 'id')
      .where(`${this.metadata.tableName}.owner_id = :ownerId`, { ownerId })
      .andWhere(`${this.metadata.tableName}.status IN (:...statuses)`, {
        statuses: [TournamentStatus.DRAFT, TournamentStatus.ACTIVE],
      })
      .orderBy(`${this.metadata.tableName}.created_at`, 'ASC')
      .limit(1)
      .getRawOne<OpenOwnedTournamentRead>();

    return result ?? null;
  }
}
