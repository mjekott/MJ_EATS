import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth-user.decorator';
import { Role } from '../auth/role.decorator';
import { User } from '../users/entities/user.entities';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { OrdersService } from './orders.service';

@Resolver()
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Role(['OWNER'])
  @Mutation(() => CreateOrderOutput)
  async createOrder(
    @AuthUser() customer: User,
    @Args('createOrderInput') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(customer, createOrderInput);
  }
}
