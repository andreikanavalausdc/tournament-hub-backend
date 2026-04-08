import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { TournamentEntity } from './tournament.entity';

@Entity('tournament_participants')
export class TournamentParticipantEntity {
  @PrimaryColumn({ type: 'uuid', name: 'tournament_id' })
  tournamentId: string;

  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => TournamentEntity, (t) => t.participants, { onDelete: 'CASCADE' })
  tournament: TournamentEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
