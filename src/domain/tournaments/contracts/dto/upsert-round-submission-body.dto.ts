import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpsertRoundSubmissionBodyDTO {
  @ApiProperty({ description: 'Submission content', minLength: 1, maxLength: 4000 })
  @IsString({ message: 'Submission content must be a string' })
  @MinLength(1, { message: 'Submission content must not be empty' })
  @MaxLength(4000, { message: 'Submission content must be at most 4000 characters' })
  content: string;
}
