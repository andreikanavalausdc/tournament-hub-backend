import { BaseEntity } from '@shared/entities/base.entity';
import { TournamentVoteSource } from '@src/domain/tournaments/enums/tournament-vote-source.enum';
import { TournamentVoteValue } from '@src/domain/tournaments/enums/tournament-vote-value.enum';
import { Column, Entity, Index } from 'typeorm';

@Entity('tournament_round_votes')
@Index(['roundId', 'submissionId', 'voterId'], { unique: true })
export class TournamentRoundVoteEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  roundId: string;

  @Column({ type: 'uuid' })
  submissionId: string;

  @Column({ type: 'uuid' })
  voterId: string;

  @Column({ type: 'enum', enum: TournamentVoteValue, enumName: 'tournament_vote_value_enum' })
  value: TournamentVoteValue;

  @Column({ type: 'enum', enum: TournamentVoteSource, enumName: 'tournament_vote_source_enum' })
  source: TournamentVoteSource;

  @Column({ type: 'timestamptz' })
  votedAt: Date;
}
