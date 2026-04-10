import { CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('tournament_participants')
export class TournamentParticipantEntity {
  @PrimaryColumn({ type: 'uuid' })
  tournamentId: string;

  @PrimaryColumn({ type: 'uuid' })
  userId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
