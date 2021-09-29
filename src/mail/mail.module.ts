import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/constant';
import { MailModuleOptions } from './mail.interfaces';
import { MailService } from './main.services';

@Module({})
@Global()
export class MailModule {
  static forRoot(options: MailModuleOptions): DynamicModule {
    return {
      module: MailModule,
      exports: [MailService],
      providers: [MailService, { provide: CONFIG_OPTIONS, useValue: options }],
    };
  }
}
