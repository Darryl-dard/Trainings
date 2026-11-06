import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { HealthCheckResult } from '@nestjs/terminus';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PaginatedMembersDto } from '../src/members/dto/paginated-members.dto';
import { MemberEntity } from '../src/members/entities/member.entity';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Members API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const server = (): App => app.getHttpServer() as App;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.member.deleteMany();
  });

  afterAll(async () => {
    await prisma.member.deleteMany();
    await app.close();
  });

  it('supports the full member lifecycle', async () => {
    const createdResponse = await request(server())
      .post('/members')
      .send({
        firstName: '  Ada ',
        lastName: 'Lovelace',
        email: 'Ada@Example.com',
      })
      .expect(201);
    const member = createdResponse.body as MemberEntity;
    expect(member.firstName).toBe('Ada');
    expect(member.email).toBe('ada@example.com');

    await request(server())
      .post('/members')
      .send({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      })
      .expect(409);

    await request(server())
      .post('/members')
      .send({ firstName: '', lastName: 'X', email: 'not-an-email' })
      .expect(400);
    await request(server())
      .post('/members')
      .send({
        firstName: 'Bob',
        lastName: 'Martin',
        email: 'bob@example.com',
        role: 'admin',
      })
      .expect(400);

    const fetchedResponse = await request(server())
      .get(`/members/${member.id}`)
      .expect(200);
    expect((fetchedResponse.body as MemberEntity).id).toBe(member.id);

    const listResponse = await request(server())
      .get('/members?page=1&limit=10')
      .expect(200);
    const page = listResponse.body as PaginatedMembersDto;
    expect(page.data).toHaveLength(1);
    expect(page.meta).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });

    const updatedResponse = await request(server())
      .patch(`/members/${member.id}`)
      .send({ email: 'ADA.L@Example.com' })
      .expect(200);
    expect((updatedResponse.body as MemberEntity).email).toBe(
      'ada.l@example.com',
    );

    await request(server()).delete(`/members/${member.id}`).expect(204);
    await request(server()).get(`/members/${member.id}`).expect(404);
    await request(server()).delete(`/members/${member.id}`).expect(404);
  });

  it('reports a healthy application and database on GET /health', async () => {
    const response = await request(server()).get('/health').expect(200);
    const body = response.body as HealthCheckResult;

    expect(body.status).toBe('ok');
    expect(body.info).toHaveProperty('database.status', 'up');
  });
});
