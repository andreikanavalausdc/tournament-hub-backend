import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TournamentVisibility } from '@src/domain/tournaments/enums/tournament-visibility.enum';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

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

  @ApiProperty({ enum: [15, 30, 45], description: 'Submission phase duration in seconds' })
  @IsInt({ message: 'Submission duration must be an integer' })
  @IsIn([15, 30, 45], { message: 'Submission duration must be 15, 30, or 45 seconds' })
  submissionDurationSeconds: number;
}
