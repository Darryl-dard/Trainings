import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { vi } from 'vitest';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MembersService } from './members.service';

const prismaError = (code: string): Prisma.PrismaClientKnownRequestError =>
  new Prisma.PrismaClientKnownRequestError(`Prisma error ${code}`, {
    code,
    clientVersion: 'test',
  });

describe('MembersService', () => {
  let service: MembersService;

  const prismaMock = {
    member: {
      create: vi.fn(),
      update: vi.fn(),
    },
  };

  const dto = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = moduleRef.get(MembersService);
  });

  it('translates a unique constraint violation (P2002) into a 409 on create', async () => {
    prismaMock.member.create.mockRejectedValue(prismaError('P2002'));

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('translates a missing record (P2025) into a 404 on update', async () => {
    prismaMock.member.update.mockRejectedValue(prismaError('P2025'));

    await expect(
      service.update('3f2b8c1e-5d4a-4c8e-9a1b-7e6d5c4b3a29', {
        firstName: 'Grace',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rethrows unexpected errors untouched', async () => {
    const failure = new Error('connection lost');
    prismaMock.member.create.mockRejectedValue(failure);

    await expect(service.create(dto)).rejects.toBe(failure);
  });
});
