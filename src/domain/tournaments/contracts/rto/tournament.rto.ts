import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TournamentStatus } from '@src/domain/tournaments/enums/tournament-status.enum';
import { TournamentVisibility } from '@src/domain/tournaments/enums/tournament-visibility.enum';

export class TournamentRTO {
  @ApiProperty({ format: 'uuid', description: 'Identifier' })
  id: string;

  @ApiProperty({ format: 'date-time', description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time', description: 'Update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'Title' })
  title: string;

  @ApiPropertyOptional({ description: 'Description' })
  description: string | null;

  @ApiProperty({ enum: TournamentVisibility, description: 'Visibility' })
  visibility: TournamentVisibility;

  @ApiProperty({ description: 'Rounds count' })
  roundsCount: number;

  @ApiProperty({ description: 'Submission phase duration in seconds' })
  submissionDurationSeconds: number;

  @ApiProperty({ description: 'Per-submission voting duration in seconds' })
  voteDurationSeconds: number;

  @ApiProperty({ enum: TournamentStatus, description: 'Status' })
  status: TournamentStatus;

  @ApiPropertyOptional({ format: 'uuid', description: 'InviteToken' })
  inviteToken: string | null;

  @ApiProperty({ format: 'uuid', description: 'Owner identifier' })
  ownerId: string;
}
