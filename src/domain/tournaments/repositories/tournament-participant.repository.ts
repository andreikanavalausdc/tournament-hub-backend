import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';
import { TournamentStatus } from '@src/domain/tournaments/enums/tournament-status.enum';
import { EntityManager, type QueryRunner, Repository, type SelectQueryBuilder } from 'typeorm';

import { TournamentParticipantEntity } from '../entities/tournament-participant.entity';

export type ActiveLiveTournamentRead = {
  id: string;
  title: string;
  status: TournamentStatus.ACTIVE;
  roundId: string;
  roundNumber: number;
  phase: TournamentRoundPhase;
};

export type ActiveTournamentParticipationRead = {
  tournamentId: string;
};

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

  async findActiveTournamentParticipationByUserId(
    userId: string,
    excludeTournamentId?: string,
    manager?: EntityManager,
  ): Promise<ActiveTournamentParticipationRead | null> {
    const repository = manager?.getRepository(TournamentParticipantEntity) ?? this;

    const qb = repository
      .createQueryBuilder(this.tableAlias)
      .innerJoin('tournaments', 't', `t.id = ${this.tableAlias}.tournament_id`)
      .select('t.id', 'tournamentId')
      .where(`${this.tableAlias}.user_id = :userId`, { userId })
      .andWhere('t.status = :status', { status: TournamentStatus.ACTIVE })
      .orderBy('t.created_at', 'ASC')
      .limit(1);

    if (excludeTournamentId) {
      qb.andWhere(`${this.tableAlias}.tournament_id <> :excludeTournamentId`, { excludeTournamentId });
    }

    const result = await qb.getRawOne<ActiveTournamentParticipationRead>();

    return result ?? null;
  }

  async findUserIdsByTournamentId(tournamentId: string): Promise<string[]> {
    const participants = await this.find({
      where: { tournamentId },
      select: { userId: true },
    });

    return participants.map((participant) => participant.userId);
  }

  async findActiveLiveTournamentByUserId(userId: string): Promise<ActiveLiveTournamentRead | null> {
    const result = await this.createQueryBuilder(this.tableAlias)
      .innerJoin('tournaments', 't', `t.id = ${this.tableAlias}.tournament_id`)
      .innerJoin('tournament_rounds', 'r', 'r.tournament_id = t.id AND r.completed_at IS NULL')
      .select('t.id', 'id')
      .addSelect('t.title', 'title')
      .addSelect('t.status', 'status')
      .addSelect('r.id', 'roundId')
      .addSelect('r.number', 'roundNumber')
      .addSelect('r.phase', 'phase')
      .where(`${this.tableAlias}.user_id = :userId`, { userId })
      .andWhere('t.status = :status', { status: TournamentStatus.ACTIVE })
      .orderBy('r.number', 'DESC')
      .addOrderBy('t.created_at', 'ASC')
      .limit(1)
      .getRawOne<ActiveLiveTournamentRead>();

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      title: result.title,
      status: result.status,
      roundId: result.roundId,
      roundNumber: Number(result.roundNumber),
      phase: result.phase,
    };
  }

  protected getBaseQuery(queryRunner?: QueryRunner): SelectQueryBuilder<TournamentParticipantEntity> {
    return this.createQueryBuilder(this.tableAlias, queryRunner);
  }
}
