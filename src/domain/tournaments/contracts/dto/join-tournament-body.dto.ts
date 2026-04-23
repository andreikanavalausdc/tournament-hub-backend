import { ApiPropertyOptional } from '@nestjs/swagger';
import { APP_UUID_VERSION } from '@shared/constants/app.constants';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class JoinTournamentBodyDTO {
  @ApiPropertyOptional({ format: 'uuid', description: 'Invite token for private tournaments' })
  @IsOptional()
  @IsUUID(APP_UUID_VERSION, { message: 'inviteToken must be a valid UUID' })
  @IsString({ message: 'inviteToken must be a string' })
  inviteToken?: string;
}


