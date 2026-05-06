import { BaseEntity } from '@shared/entities/base.entity';
import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';
import { TournamentRoundVotingStepStatus } from '@src/domain/tournaments/enums/tournament-round-voting-step-status.enum';
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

  @Column({ type: 'uuid', nullable: true })
  currentVotingSubmissionId: string | null;

  @Column({ type: 'int', nullable: true })
  currentRevealIndex: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  votingDeadline: Date | null;

  @Column({
    type: 'enum',
    enum: TournamentRoundVotingStepStatus,
    enumName: 'tournament_round_voting_step_status_enum',
    default: TournamentRoundVotingStepStatus.IDLE,
  })
  votingStepStatus: TournamentRoundVotingStepStatus;

  @Column({ type: 'timestamptz', nullable: true })
  votingCompletedAt: Date | null;
}
