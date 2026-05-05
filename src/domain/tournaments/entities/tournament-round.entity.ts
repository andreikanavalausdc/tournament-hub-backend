import { BaseEntity } from '@shared/entities/base.entity';
import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';
import { Column, Entity, Index } from 'typeorm';

@Entity('tournament_rounds')
@Index(['tournamentId', 'number'], { unique: true })
export class TournamentRoundEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  tournamentId: string;

  @Column({ type: 'int' })
  number: number;

  @Column({ type: 'enum', enum: TournamentRoundPhase, enumName: 'tournament_round_phase_enum' })
  phase: TournamentRoundPhase;

  @Column({ type: 'timestamptz' })
  submissionDeadline: Date;

  @Column({ type: 'timestamptz', nullable: true })
  submissionClosedAt: Date | null;
}
