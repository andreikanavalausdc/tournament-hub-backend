import { CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('tournament_participants')
export class TournamentParticipantEntity {
  @PrimaryColumn({ type: 'uuid', name: 'tournament_id' })
  tournamentId: string;

  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
