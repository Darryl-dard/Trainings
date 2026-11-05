import { MemberEntity } from '../entities/member.entity';

export class PaginationMetaDto {
  page!: number;
  limit!: number;
  total!: number;
  totalPages!: number;
}

export class PaginatedMembersDto {
  data!: MemberEntity[];
  meta!: PaginationMetaDto;
}
