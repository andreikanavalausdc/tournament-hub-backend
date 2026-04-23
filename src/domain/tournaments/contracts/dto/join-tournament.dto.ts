import { APP_UUID_VERSION } from '@shared/constants/app.constants';
import { IsString, IsUUID } from 'class-validator';

export class JoinTournamentDTO {
  @IsUUID(APP_UUID_VERSION, { message: 'tournamentId must be a valid UUID' })
  @IsString({ message: 'tournamentId must be a string' })
  tournamentId: string;
}

