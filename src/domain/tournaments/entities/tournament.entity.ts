import { BaseEntity } from '@shared/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

import { TournamentParticipantEntity } from './tournament-participant.entity';

@Entity('tournaments')
export class TournamentEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'varchar' })
  visibility: 'public' | 'private';

  @Column({ type: 'int' })
  roundsCount: number;

  @Column({ type: 'varchar', default: 'draft' })
  status: 'draft' | 'active' | 'completed' | 'cancelled';

  @Column({ type: 'uuid', nullable: true })
  inviteToken: string | null;

  @Column({ type: 'uuid' })
  ownerId: string;

  @OneToMany(() => TournamentParticipantEntity, (p) => p.tournament)
  participants: TournamentParticipantEntity[];
}
