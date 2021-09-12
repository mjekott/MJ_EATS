import { Resolver, Query } from '@nestjs/graphql';
import { User } from './entities/user.entities';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => Boolean)
  hi() {
    return true;
  }
}