import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginBodyDTO {
  @ApiProperty({ description: 'Email' })
  @IsString({ message: 'Email address required' })
  email: string;

  @ApiProperty({ description: 'Password' })
  @IsString({ message: 'Password required' })
  password: string;
}
