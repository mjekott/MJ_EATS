import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dtos';
import { User } from './entities/user.entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  /**
   *@description creates a user given some required values
   * @body email,password,role
   * @returns Promise<CreateAccountOutput>
   */
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      // check new user
      const exists = await this.users.findOne({ where: { email } });
      if (exists) {
        throw new Error('Email is already taken');
        return;
      }
      await this.users.save(this.users.create({ email, password, role }));
      //create user && hash the password

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
