import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import * as mailgun from 'mailgun-js';
import { User } from '../src/users/entities/user.entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from '../src/users/entities/verification.entities';

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
  email: 'ekottmfon@yaho.com',
  password: 'test123456',
};

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
  let token: string;
  let userRepository: Repository<User>;
  let verificationRepository: Repository<Verification>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationRepository = module.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount', () => {
    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: ` 
          mutation {
            createAccount(
              input: {email: "${testUser.email}", password: "${testUser.password}", role: CLIENT}
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
          console.log(res.body);
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
              input: {email: "${testUser.email}", password: "${testUser.password}", role: CLIENT}
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

  describe('login', () => {
    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation{
          login(input:{
            email:"${testUser.email}",
            password:"${testUser.password}"
          }){
            ok
            token
            error
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          token = login.token;
        });
    });
    it('should not be able to login with wrong credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
        mutation{
          login(input:{
            email:"test@test.com",
            password:"${testUser.password}"
          }){
            ok
            token
            error
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('Invalid Credentials');
          expect(login.token).toBe(null);
        });
    });
  });

  describe('profile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await userRepository.find();
      userId = user.id;
    });
    it('should see a users profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('Authorization', token)
        .send({
          query: `
        query{
          profile(userid:${userId}){
            ok
            user{
              id
            
            }
            error
          }
          }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                profile: {
                  ok,
                  error,
                  user: { id },
                },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(id).toBe(userId);
          expect(error).toBe(null);
        });
    });
    it('should not find a profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('Authorization', token)
        .send({
          query: `
      query{
        profile(userid:66){
          ok
          user{
            id
          }
          error
        }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                profile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(user).toBe(null);
          expect(error).toBe('User Not Found');
        });
    });
  });

  describe('me', () => {
    it('should find my profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('Authorization', token)
        .send({
          query: `
          query{
            me{
              email
              id
            }
          }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(testUser.email);
        });
    });

    it('should not allow logged out user', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          query{
            me{
              email
              id
            }
          }
          `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: { errors },
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });

  describe('editProfile', () => {
    const NEW_EMAIL = 'mail@mail.com';
    it('should update users email', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('Authorization', token)
        .send({
          query: `mutation{
          editProfile(input:{email:"${NEW_EMAIL}"}){
            ok
            error
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should have new email', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('Authorization', token)
        .send({
          query: `
      query{
        me{
          email
          id
        }
      }
      `,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(NEW_EMAIL);
        });
    });
    it('should change user password', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('Authorization', token)
        .send({
          query: `mutation{
        editProfile(input:{password:"newPassoword"}){
          ok
          error
        }
      }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
  });
  describe('verify Email', () => {
    let verificationCode: string;
    beforeAll(async () => {
      const [verification] = await verificationRepository.find();
      verificationCode = verification.code;
    });
    it('should verify email', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation {
          verifyEmail(input:{code:"${verificationCode}"}){
            ok
            error
          }
        }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });

    it('should fail on wrong verifcation code', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `mutation{
        verifyEmail(input:{code:"sfjfjffj"}){
          ok
          error
        }
      }`,
        })
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(false);
          expect(error).toBe('Verification code not found.');
        });
    });
  });
});
