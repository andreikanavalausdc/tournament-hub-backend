import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';
import { TournamentStatus } from '@src/domain/tournaments/enums/tournament-status.enum';
import { TournamentVisibility } from '@src/domain/tournaments/enums/tournament-visibility.enum';

import { RoundPromptRTO } from './round-prompt.rto';

export class FullTournamentParticipantRTO {
  @ApiProperty({ format: 'uuid', description: 'Participant user identifier' })
  userId: string;

  @ApiProperty({ description: 'Participant cumulative score' })
  cumulativeScore: number;
}

export class FullTournamentCurrentRoundRTO {
  @ApiProperty({ format: 'uuid', description: 'Round identifier' })
  id: string;

  @ApiProperty({ description: 'Round number' })
  number: number;

  @ApiProperty({ enum: TournamentRoundPhase, description: 'Round phase' })
  phase: TournamentRoundPhase;

  @ApiProperty({ type: () => RoundPromptRTO })
  prompt: RoundPromptRTO;

  @ApiProperty({ format: 'date-time', description: 'Submission deadline' })
  submissionDeadline: string;

  @ApiPropertyOptional({ format: 'date-time', description: 'Submission phase close timestamp' })
  submissionClosedAt: string | null;

  @ApiPropertyOptional({ format: 'date-time', description: 'Current voting deadline' })
  votingDeadline: string | null;
}

export class FullTournamentRTO {
  @ApiProperty({ format: 'uuid', description: 'Tournament identifier' })
  id: string;

  @ApiProperty({ description: 'Tournament title' })
  title: string;

  @ApiPropertyOptional({ description: 'Tournament description' })
  description: string | null;

  @ApiProperty({ enum: TournamentVisibility, description: 'Tournament visibility' })
  visibility: TournamentVisibility;

  @ApiProperty({ enum: TournamentStatus, description: 'Tournament status' })
  status: TournamentStatus;

  @ApiProperty({ description: 'Configured rounds count' })
  roundsCount: number;

  @ApiProperty({ description: 'Submission phase duration in seconds' })
  submissionDurationSeconds: number;

  @ApiProperty({ description: 'Per-submission voting duration in seconds' })
  voteDurationSeconds: number;

  @ApiProperty({ format: 'uuid', description: 'Owner user identifier' })
  ownerId: string;

  @ApiProperty({ type: () => [FullTournamentParticipantRTO] })
  participants: FullTournamentParticipantRTO[];

  @ApiProperty({ type: () => FullTournamentCurrentRoundRTO, nullable: true })
  currentRound: FullTournamentCurrentRoundRTO | null;
}
