import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { JwtService } from 'src/jwt/jwt.services';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dtos';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entities';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Query(() => Boolean)
  hi() {
    return true;
  }

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }
}
