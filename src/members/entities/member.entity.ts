import { ApiProperty } from '@nestjs/swagger';

export class MemberEntity {
  @ApiProperty({
    format: 'uuid',
    example: '3f2b8c1e-5d4a-4c8e-9a1b-7e6d5c4b3a29',
  })
  id!: string;

  @ApiProperty({ example: 'Ada' })
  firstName!: string;

  @ApiProperty({ example: 'Lovelace' })
  lastName!: string;

  @ApiProperty({
    format: 'email',
    example: 'ada@example.com',
    description: 'Always stored in lowercase.',
  })
  email!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
