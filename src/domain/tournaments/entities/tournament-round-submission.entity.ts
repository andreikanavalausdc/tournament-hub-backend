import { BaseEntity } from '@shared/entities/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('tournament_round_submissions')
@Index(['roundId', 'authorId'], { unique: true })
export class TournamentRoundSubmissionEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  roundId: string;

  @Column({ type: 'uuid' })
  authorId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamptz' })
  submittedAt: Date;
}
