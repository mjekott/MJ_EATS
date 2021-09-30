import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';
import * as mailgun from 'mailgun-js';

const GRAPHQL_ENDPOINT = '/graphql';

const mg = mailgun({} as any);

jest.mock('mailgun-js', () => {
  const mMailgun = {
    messages: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  return jest.fn(() => mMailgun);
});

(mg.messages().send as jest.MockedFunction<any>).mockResolvedValueOnce({
  id: '222',
  message: 'Queued. Thank you.',
});

describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount', () => {
    const EMAIL = 'ekottmfon@yaho.com';
    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: ` 
          mutation {
            createAccount(
              input: {email: "${EMAIL}", password: "ttoke4real", role: CLIENT}
            ) {
              ok
              error
              user {
                id
              }
            }
          }
          
         `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });

    it('should fail if account already exist ', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: ` 
          mutation {
            createAccount(
              input: {email: "${EMAIL}", password: "ttoke4real", role: CLIENT}
            ) {
              ok
              error
              user {
                id
              }
            }
          }
          
         `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toEqual(expect.any(String));
          expect(res.body.data.createAccount.error).toEqual(
            'There is a user with that email already',
          );
        });
    });
  });
});
