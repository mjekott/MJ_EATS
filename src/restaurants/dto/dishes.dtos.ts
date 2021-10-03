import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/core-output.dto';

import { Dish } from '../entities/dish.entity';

@InputType()
export class CreateDishInput extends PickType(Dish, [
  'name',
  'price',
  'description',
  'options',
]) {
  @Field(() => Number)
  restaurantId: number;
}

@ObjectType()
export class CreateDishOutput extends CoreOutput {}

@InputType()
export class DeleteDishInput {
  @Field(() => Number)
  dishId: number;
}

@InputType()
export class DeleteDishOuput extends CoreOutput {}

@InputType()
export class UpdateDishInput extends PickType(PartialType(Dish), [
  'name',
  'options',
  'price',
  'description',
]) {
  @Field(() => Number)
  dishId: number;
}

@InputType()
export class UpdateDishOuput extends CoreOutput {}
