import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dtos';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entities';
import { JwtService } from 'src/jwt/jwt.services';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   *@description creates a user given the required fields
   * @Args email,password,role
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

  /***
   * @description login a user given the required fields
   * @Args email,password
   * @returns Promise<LoginOutput>
   */
  async login({ email, password }: LoginInput) {
    try {
      //check is user exist
      const user = await this.users.findOne({ where: { email } });
      if (!user) {
        throw new Error('Invalid Credentials');
      }
      //check if password match
      const isMatch = await user.checkPassword(password);
      if (!isMatch) {
        throw new Error('Invalid Credentials');
      }
      // generate token
      const token = this.jwtService.sign(user.id);

      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<User> {
    return this.users.findOne({ id });
  }
}
