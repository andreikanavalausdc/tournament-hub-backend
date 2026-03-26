import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class CommonResponseRTO<T> {
  @ApiProperty({ enumName: 'HttpStatus', enum: HttpStatus, description: 'Status code' })
  code: HttpStatus;

  @ApiProperty({ description: 'Error status' })
  message: string[];

  @ApiProperty({ description: 'Response body from the server' })
  data: T | null;

  @ApiProperty({ example: null, description: 'Error status explanation' })
  error: string | null;
}
