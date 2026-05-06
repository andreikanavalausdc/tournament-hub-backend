import { ApiProperty } from '@nestjs/swagger';
import { APP_UUID_VERSION } from '@shared/constants/app.constants';
import { TournamentVoteValue } from '@src/domain/tournaments/enums/tournament-vote-value.enum';
import { IsEnum, IsUUID } from 'class-validator';

export class UpsertRoundVoteBodyDTO {
  @ApiProperty({ description: 'Currently revealed submission id' })
  @IsUUID(APP_UUID_VERSION)
  submissionId: string;

  @ApiProperty({ enum: TournamentVoteValue, description: 'Vote value' })
  @IsEnum(TournamentVoteValue)
  value: TournamentVoteValue;
}
