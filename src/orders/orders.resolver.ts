import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth-user.decorator';
import { Role } from '../auth/role.decorator';
import { User } from '../users/entities/user.entities';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { GetOrdersInputType, GetOrdersOutput } from './dtos/get-orders.dtos';
import { OrdersService } from './orders.service';

@Resolver()
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Role(['CLIENT'])
  @Mutation(() => CreateOrderOutput)
  async createOrder(
    @AuthUser() customer: User,
    @Args('createOrderInput') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(customer, createOrderInput);
  }

  @Role(['ANY'])
  @Mutation(() => GetOrdersOutput)
  async getOrders(
    @AuthUser() user: User,
    @Args('getOrdersInput') getOrdersInput: GetOrdersInputType,
  ): Promise<GetOrdersOutput> {
    return this.ordersService.getOrders(user, getOrdersInput);
  }
}
