import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('tournament_participants')
export class TournamentParticipantEntity {
  @PrimaryColumn({ type: 'uuid' })
  tournamentId: string;

  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  @Column({ type: 'int', default: 0 })
  cumulativeScore: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
