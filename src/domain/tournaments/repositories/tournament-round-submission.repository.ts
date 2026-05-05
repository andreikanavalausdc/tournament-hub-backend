import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { BaseRepository } from '@shared/repositories/base.repository';
import { EntityManager } from 'typeorm';

import { TournamentRoundSubmissionEntity } from '../entities/tournament-round-submission.entity';

@Injectable()
export class TournamentRoundSubmissionRepository extends BaseRepository<TournamentRoundSubmissionEntity> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(TournamentRoundSubmissionEntity, entityManager);
  }

  async countDistinctAuthors(roundId: string): Promise<number> {
    const result = await this.createQueryBuilder('submission')
      .select('COUNT(DISTINCT submission.author_id)', 'count')
      .where('submission.round_id = :roundId', { roundId })
      .getRawOne<{ count: string }>();

    return Number(result?.count ?? 0);
  }
}
