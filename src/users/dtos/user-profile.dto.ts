import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/core-output';
import { User } from '../entities/user.entities';

@ArgsType()
export class UserProfileInput {
  @Field(() => Number)
  userid: number;
}

@ObjectType()
export class UserProfileOutput extends CoreOutput {
  @Field(() => User, { nullable: true })
  user?: User;
}
