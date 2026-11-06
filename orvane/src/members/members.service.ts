import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { Member, Prisma } from '../generated/prisma/client';
import { ListMembersQueryDto } from './dto/list-members-query.dto';
import { PaginatedMembersDto } from './dto/paginated-members.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMemberDto): Promise<Member> {
    try {
      return await this.prisma.member.create({ data: { ...dto } });
    } catch (error) {
      this.rethrow(error);
    }
  }

  async findAll({
    page,
    limit,
  }: ListMembersQueryDto): Promise<PaginatedMembersDto> {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.member.findMany({
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.member.count(),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Member> {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    return member;
  }

  async update(id: string, dto: UpdateMemberDto): Promise<Member> {
    try {
      return await this.prisma.member.update({
        where: { id },
        data: { ...dto },
      });
    } catch (error) {
      this.rethrow(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.member.delete({ where: { id } });
    } catch (error) {
      this.rethrow(error);
    }
  }

  private rethrow(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('A member with this email already exists');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Member not found');
      }
    }
    throw error;
  }
}
