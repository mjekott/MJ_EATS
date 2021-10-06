import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver, Query, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser } from '../auth/auth-user.decorator';
import { Role } from '../auth/role.decorator';
import {
  NEW_DELIVERY_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from '../common/constant';
import { User } from '../users/entities/user.entities';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { GetOrderInput, GetOrderOuput } from './dtos/get-order.dto';
import { GetOrdersInputType, GetOrdersOutput } from './dtos/get-orders.dtos';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';
import { OrderInput } from './dtos/update-order.dto';
import { Order } from './entity/orders';
import { OrdersService } from './orders.service';

@Resolver()
export class OrdersResolver {
  constructor(
    private readonly ordersService: OrdersService,
    @Inject(PUB_SUB) private readonly pubsub: PubSub,
  ) {}

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

  @Mutation(()=>TakeOrderOutput)
  async takeOrder(@AuthUser() driver:User,@Args('takeOrderInput',takeOrderInput:TakeOrderInput)):Promise<TakeOrderOutput>{
    return this.ordersService.takeOrder(driver, takeOrderInput)
  }

  @Subscription(() => Order, {
    filter: ({ pendinOrders: { ownerId } }, _, { user }) => {
      return ownerId === user.id;
    },
    resolve: ({ pendingOrders: { order } }) => order,
  })
  @Role(['OWNER'])
  pendingOrders() {
    return this.pubsub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Role(['DELIVERY'])
  pendingDelivery() {
    return this.pubsub.asyncIterator(NEW_DELIVERY_ORDER);
  }

  @Subscription(() => Order, {
    filter: (
      { orderUpdate: order }: { orderUpdate: Order },
      { orderInput }: { orderInput: OrderInput },
      { user }: { user: User },
    ) => {
      if (
        order.driverId !== user.id &&
        order.customerId !== user.id &&
        order.restaurant.ownerId !== user.id
      ) {
        return false;
      }
      return order.id === orderInput.id;
    },
  })
  orderUpdate(@Args('orderInput') orderInput: OrderInput) {
    return this.pubsub.asyncIterator(NEW_ORDER_UPDATE);
  }

  
}
