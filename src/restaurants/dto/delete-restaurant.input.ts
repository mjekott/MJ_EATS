import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/core-output.dto';

@InputType()
export class DeleteRestaurantInput {
  @Field(() => Number)
  restaurantid: number;
}

@ObjectType()
export class DeleteRestaurantOuput extends CoreOutput {}
