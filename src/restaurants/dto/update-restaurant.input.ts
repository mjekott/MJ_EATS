import { CreateRestaurantInput } from './create-restaurant.input';
import { InputType, PartialType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/core-output.dto';

@InputType()
export class UpdateRestaurantInput extends PartialType(CreateRestaurantInput) {}

@ObjectType()
export class UpdateRestaurantOutput extends CoreOutput {}
