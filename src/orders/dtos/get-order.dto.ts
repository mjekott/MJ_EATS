import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from '../../common/dtos/core-output.dto';
import { Order } from '../entity/orders';

@InputType()
export class GetOrderInput extends PickType(Order, ['id']) {}

@ObjectType()
export class GetOrderOuput extends CoreOutput {
  @Field(() => Order, { nullable: true })
  order?: Order;
}
