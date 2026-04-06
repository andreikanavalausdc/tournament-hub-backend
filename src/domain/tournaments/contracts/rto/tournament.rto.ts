import { ApiProperty } from '@nestjs/swagger';

export class TournamentRTO {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time' })
  updatedAt: Date;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ enum: ['public', 'private'] })
  visibility: 'public' | 'private';

  @ApiProperty()
  roundsCount: number;

  @ApiProperty({ enum: ['draft', 'active', 'completed', 'cancelled'] })
  status: string;

  @ApiProperty({ format: 'uuid', nullable: true })
  inviteToken: string | null;

  @ApiProperty({ format: 'uuid' })
  ownerId: string;
}
