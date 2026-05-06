import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { BaseRepository } from '@shared/repositories/base.repository';
import { TournamentVoteValue } from '@src/domain/tournaments/enums/tournament-vote-value.enum';
import { EntityManager, In } from 'typeorm';

import { TournamentRoundVoteEntity } from '../entities/tournament-round-vote.entity';

@Injectable()
export class TournamentRoundVoteRepository extends BaseRepository<TournamentRoundVoteEntity> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(TournamentRoundVoteEntity, entityManager);
  }

  async countVoters(roundId: string, submissionId: string, voterIds?: string[]): Promise<number> {
    if (voterIds && voterIds.length === 0) {
      return 0;
    }

    const where = voterIds
      ? { roundId, submissionId, voterId: In(voterIds) }
      : { roundId, submissionId };

    return this.count({ where });
  }

  async findVoterIds(roundId: string, submissionId: string, voterIds?: string[]): Promise<string[]> {
    if (voterIds && voterIds.length === 0) {
      return [];
    }

    const where = voterIds
      ? { roundId, submissionId, voterId: In(voterIds) }
      : { roundId, submissionId };
    const votes = await this.find({ where, select: { voterId: true } });

    return votes.map((vote) => vote.voterId);
  }

  async countByValue(roundId: string, submissionId: string, value: TournamentVoteValue): Promise<number> {
    return this.count({ where: { roundId, submissionId, value } });
  }
}
