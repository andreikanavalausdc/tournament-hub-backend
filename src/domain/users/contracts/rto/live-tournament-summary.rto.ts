import { ApiProperty } from '@nestjs/swagger';
import { TournamentRoundPhase } from '@src/domain/tournaments/enums/tournament-round-phase.enum';
import { TournamentStatus } from '@src/domain/tournaments/enums/tournament-status.enum';

export class LiveTournamentSummaryRTO {
  @ApiProperty({ format: 'uuid', description: 'Tournament identifier' })
  id: string;

  @ApiProperty({ description: 'Tournament title' })
  title: string;

  @ApiProperty({ enum: TournamentStatus, description: 'Tournament status' })
  status: TournamentStatus.ACTIVE;

  @ApiProperty({ format: 'uuid', description: 'Current round identifier' })
  roundId: string;

  @ApiProperty({ description: 'Current round number' })
  roundNumber: number;

  @ApiProperty({ enum: TournamentRoundPhase, description: 'Current round phase' })
  phase: TournamentRoundPhase;
}
