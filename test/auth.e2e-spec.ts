import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module'; // Path to your AppModule

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/login (POST) should return a token', async () => {
    const response = await request(app.getHttpServer())
      .post('/login')
      .send({
        email: 'example@gmail.com',
        password: 'superadmin',
      })
      .expect(200);

    expect(response.body).toHaveProperty('token');
    token = response.body.token;
  });

  afterAll(async () => {
    await app.close();
  });
});
