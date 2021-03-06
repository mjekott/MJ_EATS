import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/constant';
import { EmailVar, MailModuleOptions } from './mail.interfaces';
import { mapData, sendCallback } from './mail.helper';
import * as mailgun from 'mailgun-js';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  async sendMail(
    subject: string,
    to: string,
    template: string,

    emailVars: EmailVar[],
  ): Promise<any> {
    const mg = mailgun({
      apiKey: this.options.apiKey,
      domain: this.options.domain,
    });
    const emailData = {};
    mapData(emailData, emailVars);
    const data = {
      from: 'Excited User <me@samples.mailgun.org>',
      to: to,
      subject: subject,
      text: 'Testing some Mailgun awesomness!',
      template: template,
      'h:X-Mailgun-Variables': JSON.stringify(emailData),
    };
    return mg.messages().send(data, sendCallback);
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendMail('Verify Your Email', email, 'initial', [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
