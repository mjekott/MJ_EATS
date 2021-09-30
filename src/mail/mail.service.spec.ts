import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from '../common/constant';
import { MailService } from './mail.services';
import * as mailgun from 'mailgun-js';
import { mapData } from './mail.helper';

jest.mock('mailgun-js', () => {
  const mMailgun = {
    messages: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  return jest.fn(() => mMailgun);
});

jest.mock('./mail.helper', () => {
  return {
    mapData: jest.fn(() => []),
  };
});

const OPTIONS = {
  apiKey: 'test',
  domain: 'test',
  fromEmail: 'test@mail.com',
};

describe('MailService', () => {
  let service: MailService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: OPTIONS,
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  describe('sendMail', () => {
    it('sends email', async () => {
      const mg = mailgun({} as any);

      (mg.messages().send as jest.MockedFunction<any>).mockResolvedValueOnce({
        id: '222',
        message: 'Queued. Thank you.',
      });

      const result = await service.sendMail('', '', '', []);
      expect(mg.messages().send).toBeCalledTimes(1);
      expect(result).toEqual({ id: '222', message: 'Queued. Thank you.' });
    });
  });

  describe('sendVerificationEmail', () => {
    it('should call sendEmail', () => {
      const sendVerficationArgs = {
        email: 'email',
        code: 'code',
      };
      jest.spyOn(service, 'sendMail').mockImplementation(async () => {});
      service.sendVerificationEmail(
        sendVerficationArgs.email,
        sendVerficationArgs.code,
      );
      expect(service.sendMail).toBeCalledTimes(1);
      expect(service.sendMail).toBeCalledWith(
        'Verify Your Email',
        'email',
        'initial',

        [
          { key: 'code', value: sendVerficationArgs.code },
          { key: 'username', value: sendVerficationArgs.email },
        ],
      );
    });
  });
});
