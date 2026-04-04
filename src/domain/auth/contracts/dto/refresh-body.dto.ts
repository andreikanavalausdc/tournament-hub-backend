import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshBodyDTO {
  @ApiProperty({ description: 'Refresh token' })
  @IsString({ message: 'Refresh token required' })
  refreshToken: string;
}
