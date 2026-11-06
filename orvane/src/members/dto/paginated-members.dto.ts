import { ApiProperty } from '@nestjs/swagger';
import { MemberEntity } from '../entities/member.entity';

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 42, description: 'Total number of members.' })
  total!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class PaginatedMembersDto {
  @ApiProperty({ type: [MemberEntity] })
  data!: MemberEntity[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
