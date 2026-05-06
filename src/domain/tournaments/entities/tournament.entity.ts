import { BaseEntity } from '@shared/entities/base.entity';
import { TournamentStatus } from '@src/domain/tournaments/enums/tournament-status.enum';
import { TournamentVisibility } from '@src/domain/tournaments/enums/tournament-visibility.enum';
import { Column, Entity } from 'typeorm';

@Entity('tournaments')
export class TournamentEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: TournamentVisibility, enumName: 'tournament_visibility' })
  visibility: TournamentVisibility;

  @Column({ type: 'int' })
  roundsCount: number;

  @Column({ type: 'int' })
  submissionDurationSeconds: number;

  @Column({ type: 'int' })
  voteDurationSeconds: number;

  @Column({ type: 'enum', enum: TournamentStatus, enumName: 'tournament_status', default: TournamentStatus.DRAFT })
  status: TournamentStatus;

  @Column({ type: 'uuid', nullable: true })
  inviteToken: string | null;

  @Column({ type: 'uuid' })
  ownerId: string;
}
