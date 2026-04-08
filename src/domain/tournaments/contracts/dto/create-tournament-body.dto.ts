import { ApiProperty } from '@nestjs/swagger';
import { TournamentVisibility } from '@src/domain/tournaments/enums/tournament-visibility.enum';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateTournamentBodyDTO {
  @ApiProperty()
  @IsString({ message: 'Title must be a string' })
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({ enum: TournamentVisibility })
  @IsEnum(TournamentVisibility, {
    message: 'Visibility must be either "public" or "private"',
  })
  visibility: TournamentVisibility;

  @ApiProperty({ minimum: 1 })
  @IsInt({ message: 'Rounds count must be an integer' })
  @Min(1, { message: 'Rounds count must be at least 1' })
  roundsCount: number;
}
