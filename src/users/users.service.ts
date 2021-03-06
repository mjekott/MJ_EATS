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
import { JwtService } from 'src/jwt/jwt.service';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entities';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { MailService } from '../mail/mail.services';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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
        return { ok: false, error: 'There is a user with that email already' };
      }
      //create user && hash the password
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      //ccreate verfication code and save in database

      const verification = await this.verification.save(
        this.verification.create({ user }),
      );

      this.mailService.sendVerificationEmail(user.email, verification.code);

      return { ok: true, user };
    } catch (error) {
      return {
        ok: false,
        error: "Coudn't create account",
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
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );
      if (!user) {
        throw new Error();
      }
      //check if password match
      const isMatch = await user.checkPassword(password);
      if (!isMatch) {
        throw new Error();
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
        error: 'Invalid Credentials',
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'User Not Found',
      };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);

      if (email) {
        const exist = await this.users.findOne({ email });
        if (exist) {
          return {
            ok: false,
            error: 'Email already taken',
          };
        }
        user.email = email;
        user.verified = false;
        await this.verification.delete({ user: { id: user.id } });
        const verification = await this.verification.save(
          this.verification.create({ user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
      }

      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not update profile.',
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verification.findOne(
        { code },
        { relations: ['user'] },
      );
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verification.delete(verification.id);
        return {
          ok: true,
        };
      }
      return {
        ok: false,
        error: 'Verification code not found.',
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not verify email.',
      };
    }
  }
}
