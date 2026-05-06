import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { TournamentStatus } from '@src/domain/tournaments/enums/tournament-status.enum';
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

  async hasUnfinishedParticipation(userId: string, excludeTournamentId?: string): Promise<boolean> {
    const qb = this.createQueryBuilder(this.tableAlias)
      .innerJoin('tournaments', 't', `t.id = ${this.tableAlias}.tournament_id`)
      .where(`${this.tableAlias}.user_id = :userId`, { userId })
      .andWhere('t.status NOT IN (:...finalStatuses)', {
        finalStatuses: [TournamentStatus.COMPLETED, TournamentStatus.CANCELLED],
      });

    if (excludeTournamentId) {
      qb.andWhere(`${this.tableAlias}.tournament_id <> :excludeTournamentId`, { excludeTournamentId });
    }

    const count = await qb.getCount();

    return count > 0;
  }

  async findUserIdsByTournamentId(tournamentId: string): Promise<string[]> {
    const participants = await this.find({
      where: { tournamentId },
      select: { userId: true },
    });

    return participants.map((participant) => participant.userId);
  }

  protected getBaseQuery(queryRunner?: QueryRunner): SelectQueryBuilder<TournamentParticipantEntity> {
    return this.createQueryBuilder(this.tableAlias, queryRunner);
  }
}
