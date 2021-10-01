import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './entities/restaurant.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.input';
import {
  UpdateRestaurantInput,
  UpdateRestaurantOutput,
} from './dto/update-restaurant.input';
import { AuthUser } from '../auth/auth-user.decorator';
import { User } from '../users/entities/user.entities';
import { Role } from '../auth/role.decorator';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOuput,
} from './dto/delete-restaurant.input';
import { Category } from './entities/category.entity';
import {
  AllCategoriesOutput,
  CategoryInput,
  CatgeoryOutput,
} from './dto/category.inputs';
import { query } from 'express';
import { RestaurantInput, RestaurantOutput } from './dto/restaurant.inputs';

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
  @Mutation(() => UpdateRestaurantOutput)
  async updateRestaurant(
    @AuthUser() owner: User,
    @Args('updateRestaurantInput') updateRestaurantInput: UpdateRestaurantInput,
  ): Promise<UpdateRestaurantOutput> {
    return this.restaurantsService.update(owner, updateRestaurantInput);
  }

  @Mutation(() => DeleteRestaurantOuput)
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args('deleteRestaurantInput') deleteRestaurantInput: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOuput> {
    return this.restaurantsService.delete(owner, deleteRestaurantInput);
  }

  @Query(() => RestaurantOutput)
  async allrestaurant(
    @Args('restaurantInput') restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    return this.restaurantsService.allRestaurants(restaurantInput);
  }
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @ResolveField(() => Number)
  async restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.countRestaurants(category);
  }

  @Query(() => AllCategoriesOutput)
  async allCategories(): Promise<AllCategoriesOutput> {
    return this.restaurantService.allCategories();
  }

  @Query(() => CatgeoryOutput)
  async category(
    @Args('categoryInput') categoryInput: CategoryInput,
  ): Promise<CatgeoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }
}
