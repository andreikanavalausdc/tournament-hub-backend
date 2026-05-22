import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TournamentStatus } from '@src/domain/tournaments/enums/tournament-status.enum';
import { TournamentVisibility } from '@src/domain/tournaments/enums/tournament-visibility.enum';

export class DraftTournamentListItemRTO {
  @ApiProperty({ format: 'uuid', description: 'Tournament identifier' })
  id: string;

  @ApiProperty({ format: 'date-time', description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time', description: 'Update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'Tournament title' })
  title: string;

  @ApiPropertyOptional({ description: 'Tournament description' })
  description: string | null;

  @ApiProperty({ enum: TournamentVisibility, description: 'Tournament visibility' })
  visibility: TournamentVisibility;

  @ApiProperty({ enum: TournamentStatus, description: 'Tournament status' })
  status: TournamentStatus.DRAFT;

  @ApiProperty({ description: 'Configured rounds count' })
  roundsCount: number;

  @ApiProperty({ description: 'Submission phase duration in seconds' })
  submissionDurationSeconds: number;

  @ApiProperty({ description: 'Per-submission voting duration in seconds' })
  voteDurationSeconds: number;

  @ApiProperty({ format: 'uuid', description: 'Owner user identifier' })
  ownerId: string;

  @ApiProperty({ description: 'Current participant count' })
  participantCount: number;
}

export class DraftTournamentParticipantRTO {
  @ApiProperty({ format: 'uuid', description: 'Participant user identifier' })
  userId: string;

  @ApiProperty({ description: 'Participant cumulative score' })
  cumulativeScore: number;
}

export class DraftTournamentDetailsRTO extends DraftTournamentListItemRTO {
  @ApiProperty({ type: () => [DraftTournamentParticipantRTO] })
  participants: DraftTournamentParticipantRTO[];
}
