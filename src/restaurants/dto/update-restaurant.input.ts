import { CreateRestaurantInput } from './create-restaurant.input';
import { InputType, PartialType, ObjectType, Field } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/core-output.dto';

@InputType()
export class UpdateRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field(() => Number)
  restaurantId: number;
}

@ObjectType()
export class UpdateRestaurantOutput extends CoreOutput {}
