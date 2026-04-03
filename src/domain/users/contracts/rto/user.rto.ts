import { ApiProperty } from '@nestjs/swagger';

export class UserRTO {
  @ApiProperty({ format: 'uuid', description: 'Identifier' })
  id: string;

  @ApiProperty({ format: 'date-time', description: 'creation date' })
  createdAt: Date;

  @ApiProperty({ format: 'date-time', description: 'update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'Email' })
  email: string;

  @ApiProperty({ description: 'Username' })
  username: string;

  @ApiProperty({ description: 'Password' })
  password: string;
}
