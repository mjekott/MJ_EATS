import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/constant';
import { JwtModuleOptions } from './interfaces/jwt-module-options.interfaces';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}
  // eslint-disable-next-line @typescript-eslint/ban-types
  sign(userid: number): string {
    return jwt.sign({ id: userid }, this.options.privateKey, {
      expiresIn: '7d',
    });
  }

  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}

// @inject(CONFIG_OPTIONS) private readonly configServoce:ConfigService
// this.configService.get("JWT_SECRET")
