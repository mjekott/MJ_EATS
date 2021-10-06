import { InputType, PickType } from '@nestjs/graphql';
import { Order } from '../entity/orders';

@InputType()
export class OrderInput extends PickType(Order, ['id']) {}
