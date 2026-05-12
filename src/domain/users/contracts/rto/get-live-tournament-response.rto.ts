import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { LiveTournamentSummaryRTO } from './live-tournament-summary.rto';

export class GetLiveTournamentResponseRTO {
  @ApiProperty({ description: 'Whether the current user participates in an active tournament' })
  hasActiveTournament: boolean;

  @ApiPropertyOptional({
    type: LiveTournamentSummaryRTO,
    nullable: true,
    description: 'Active tournament summary for app-level recovery',
  })
  tournament: LiveTournamentSummaryRTO | null;
}
