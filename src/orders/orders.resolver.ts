import { Args, Mutation, Resolver, Query, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from '../auth/auth-user.decorator';
import { Role } from '../auth/role.decorator';
import { User } from '../users/entities/user.entities';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { GetOrderInput, GetOrderOuput } from './dtos/get-order.dto';
import { GetOrdersInputType, GetOrdersOutput } from './dtos/get-orders.dtos';
import { OrdersService } from './orders.service';

const pubsub = new PubSub();

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

  @Query(() => GetOrderOuput)
  @Role(['ANY'])
  async getOrder(
    @AuthUser() user: User,
    @Args('getOrderInput') getOrderInput: GetOrderInput,
  ): Promise<GetOrderOuput> {
    return this.ordersService.getOrder(user, getOrderInput);
  }

  @Subscription(() => String)
  orderSubscription() {
    return pubsub.asyncIterator('hot patatoes');
  }
}
