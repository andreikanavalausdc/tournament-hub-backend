import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TournamentVisibility } from '@src/domain/tournaments/enums/tournament-visibility.enum';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateTournamentBodyDTO {
  @ApiProperty({ description: 'Title' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({ enum: TournamentVisibility, description: 'Visibility' })
  @IsEnum(TournamentVisibility, {
    message: 'Visibility must be either "public" or "private"',
  })
  visibility: TournamentVisibility;

  @ApiProperty({ minimum: 1, description: 'Rounds count' })
  @IsInt({ message: 'Rounds count must be an integer' })
  @Min(1, { message: 'Rounds count must be at least 1' })
  roundsCount: number;
}
