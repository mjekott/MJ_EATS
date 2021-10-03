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

import {
  RestaurantInput,
  RestaurantOutput,
  RestaurantsInput,
  RestaurantsOutput,
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dto/restaurant.inputs';
import { Dish } from './entities/dish.entity';
import {
  CreateDishInput,
  CreateDishOutput,
  DeleteDishInput,
  DeleteDishOuput,
  UpdateDishInput,
  UpdateDishOuput,
} from './dto/dishes.dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

  @Query(() => RestaurantsOutput)
  async allrestaurant(
    @Args('restaurantInput') restaurantInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantsService.allRestaurants(restaurantInput);
  }

  @Query(() => RestaurantOutput)
  async restaurant(
    @Args('restaurantInput') restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    return this.restaurantsService.findRestaurantById(restaurantInput);
  }

  @Query(() => SearchRestaurantOutput)
  searchRestaurant(
    @Args('searchRestaurantInput') searchRestaurantInput: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    return this.restaurantsService.searchRestaurantByName(
      searchRestaurantInput,
    );
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

@Resolver(() => Dish)
export class DishResolver {
  constructor(private readonly restaurantSerive: RestaurantsService) {}

  @Role(['OWNER'])
  @Mutation(() => CreateDishOutput)
  createDish(
    @AuthUser() owner: User,
    @Args('createDishInput') createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    return this.restaurantSerive.createDish(owner, createDishInput);
  }

  @Role(['OWNER'])
  @Mutation(() => CreateDishOutput)
  updateDish(
    @AuthUser() owner: User,
    @Args('updateDishInput') updateDishInput: UpdateDishInput,
  ): Promise<UpdateDishOuput> {
    return this.restaurantSerive.updateDish(owner, updateDishInput);
  }

  @Role(['OWNER'])
  @Mutation(() => CreateDishOutput)
  deleteDish(
    @AuthUser() owner: User,
    @Args('deleteDishInput') deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOuput> {
    return this.restaurantSerive.deleteDish(owner, deleteDishInput);
  }
}
