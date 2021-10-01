import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './entities/restaurant.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.input';
import { UpdateRestaurantInput } from './dto/update-restaurant.input';
import { AuthUser } from '../auth/auth-user.decorator';
import { User } from '../users/entities/user.entities';
import { Role } from '../auth/role.decorator';

@Resolver(() => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Mutation(() => CreateRestaurantOutput)
  @Role(['OWNER'])
  createRestaurant(
    @AuthUser() authUser: User,
    @Args('createRestaurantInput') createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantsService.create(authUser, createRestaurantInput);
  }

  @Query(() => [Restaurant], { name: 'restaurants' })
  findAll() {
    return this.restaurantsService.findAll();
  }

  @Query(() => Restaurant, { name: 'restaurant' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.restaurantsService.findOne(id);
  }

  @Role(['OWNER'])
  @Mutation(() => Restaurant)
  updateRestaurant(
    @AuthUser() authUser: User,
    @Args('updateRestaurantInput') updateRestaurantInput: UpdateRestaurantInput,
  ) {
    return true;
  }

  @Mutation(() => Restaurant)
  removeRestaurant(@Args('id', { type: () => Int }) id: number) {
    return this.restaurantsService.remove(id);
  }
}
