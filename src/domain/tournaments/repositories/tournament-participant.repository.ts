import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, type QueryRunner, Repository, type SelectQueryBuilder } from 'typeorm';

import { TournamentParticipantEntity } from '../entities/tournament-participant.entity';

@Injectable()
export class TournamentParticipantRepository extends Repository<TournamentParticipantEntity> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(TournamentParticipantEntity, entityManager);
  }

  protected get tableAlias(): string {
    return this.metadata.tableName;
  }

  async getByTournamentAndUser(tournamentId: string, userId: string): Promise<TournamentParticipantEntity> {
    const entity = await this.findOne({ where: { tournamentId, userId } });
    if (!entity) {
      throw new NotFoundException(`${this.tableAlias}.main.NOT_FOUND`);
    }
    return entity;
  }

  protected getBaseQuery(queryRunner?: QueryRunner): SelectQueryBuilder<TournamentParticipantEntity> {
    return this.createQueryBuilder(this.tableAlias, queryRunner);
  }
}
